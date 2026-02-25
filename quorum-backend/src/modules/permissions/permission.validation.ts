import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreatePermissionRequestDto } from "./dtos/create-permission-request.dto";
import { UpdatePermissionRequestDto } from "./dtos/update-permission-request.dto";
import { PermissionRepository } from "./permission.repository";

@Injectable()
export class PermissionValidation {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async validateCreate(dto: CreatePermissionRequestDto): Promise<void> {
    await this.ensurePermissionNameNotTaken(dto.name);
  }

  async validateUpdate(id: number, dto: UpdatePermissionRequestDto): Promise<void> {
    await this.ensurePermissionExists(id);
    await this.ensurePermissionNameNotTaken(dto.name, id);
  }

  async validateDelete(id: number): Promise<void> {
    await this.ensurePermissionExists(id);
  }

  private async ensurePermissionNameNotTaken(name: string, excludePermissionId?: number) {
    const existing = await this.permissionRepository.findByName(name);
    if (existing && existing.id !== excludePermissionId) {
      throw new ConflictException('The permission name is already taken');
    }
  }

  private async ensurePermissionExists(id: number) {
    const existing = await this.permissionRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('The permission does not exist');
    }
  }
}
