import { Injectable, NotFoundException } from "@nestjs/common";
import { PermissionEntity } from "src/entities/permission.entity";
import { PermissionRepository } from "./permission.repository";
import { CreatePermissionRequestDto } from "./dtos/create-permission-request.dto";
import { UpdatePermissionRequestDto } from "./dtos/update-permission-request.dto";
import { PermissionValidation } from "./permission.validation";

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionValidation: PermissionValidation,
  ) {}

  async getPermissions(): Promise<PermissionEntity[]> {
    return this.permissionRepository.getPermissions();
  }

  async getPermissionById(id: number): Promise<PermissionEntity> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async createPermission(createPermissionRequestDto: CreatePermissionRequestDto): Promise<PermissionEntity> {
    await this.permissionValidation.validateCreate(createPermissionRequestDto);
    const permission = await this.permissionRepository.create(
      new PermissionEntity(createPermissionRequestDto),
    );
    return new PermissionEntity(permission);
  }

  async updatePermission(
    id: number,
    updatePermissionRequestDto: UpdatePermissionRequestDto,
  ): Promise<PermissionEntity> {
    await this.permissionValidation.validateUpdate(id, updatePermissionRequestDto);
    const permission = await this.permissionRepository.update(
      id,
      new PermissionEntity(updatePermissionRequestDto),
    );
    return new PermissionEntity(permission);
  }

  async deletePermission(id: number): Promise<void> {
    await this.permissionValidation.validateDelete(id);
    return this.permissionRepository.delete(id);
  }
}
