import { ConflictException, NotFoundException } from "@nestjs/common";
import { CreateRoleRequestDto } from "./dtos/create-role-request.dto";
import { UpdateRoleRequestDto } from "./dtos/update-role-request.dto";
import { RoleRepository } from "./role.repository";

export class RoleValidation {
  constructor(private readonly roleRepository: RoleRepository) {}

  async validateCreate(dto: CreateRoleRequestDto): Promise<void> {
    await this.ensureRoleNameNotTaken(dto.name);
  }

  async validateUpdate(id: number, dto: UpdateRoleRequestDto): Promise<void> {
    await this.ensureRoleNameNotTaken(dto.name, id);
  }

  async validateDelete(id: number): Promise<void> {
    await this.ensureRoleExists(id);
  }

  private async ensureRoleNameNotTaken(name: string, excludeRoleId?: number) {
    console.log('ensureRoleNameNotTaken', name, excludeRoleId);
    const existing = await this.roleRepository.findByName(name);
    if (existing && existing.id !== excludeRoleId) {
      throw new ConflictException('The role name is already taken');
    }
  }

  private async ensureRoleExists(id: number) {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('The role does not exist');
    }
  }
}