import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateRoleRequestDto } from "./dtos/create-role-request.dto";
import { UpdateRoleRequestDto } from "./dtos/update-role-request.dto";
import { RoleRepository } from "./role.repository";
import { ROLE_ADMIN } from "src/shared/constants/role.constants";

@Injectable()
export class RoleValidation {
  constructor(private readonly roleRepository: RoleRepository) {}

  async validateCreate(dto: CreateRoleRequestDto): Promise<void> {
    await this.ensureRoleNameNotTaken(dto.name);
  }

  async validateUpdate(id: number, dto: UpdateRoleRequestDto): Promise<void> {
    await this.ensureRoleExists(id);
    await this.ensureRoleIsNotAdmin(id);
    await this.ensureRoleNameNotTaken(dto.name, id);
  }

  async validateDelete(id: number): Promise<void> {
    await this.ensureRoleIsNotAdmin(id);
    await this.ensureRoleExists(id);
  }

  private async ensureRoleNameNotTaken(name: string, excludeRoleId?: number) {
    const existing = await this.roleRepository.findByName(name);
    if (existing && existing.id !== excludeRoleId) {
      throw new ConflictException('The role name is already taken');
    }
  }

  private async ensureRoleIsNotAdmin(id: number): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (role?.name === ROLE_ADMIN) {
      throw new ForbiddenException('The role admin is not allowed to be modified');
    }
  }

  private async ensureRoleExists(id: number): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('The role does not exist');
    }
  }
}