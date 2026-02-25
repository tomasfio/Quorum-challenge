import { Injectable, NotFoundException } from "@nestjs/common";
import { PermissionEntity } from "src/entities/permission.entity";
import { PermissionRepository } from "./permission.repository";
import { CreatePermissionRequestDto } from "./dtos/create-permission-request.dto";
import { UpdatePermissionRequestDto } from "./dtos/update-permission-request.dto";
import { PermissionValidation } from "./permission.validation";
import { PermissionResponseDto } from "./dtos/permission-response.dto";

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly permissionValidation: PermissionValidation,
  ) {}

  async getPermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionRepository.getPermissions();
    return permissions.map((permission) => new PermissionResponseDto({
      id: permission.id,
      name: permission.name,
    }));
  }

  async getPermissionById(id: number): Promise<PermissionResponseDto> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return new PermissionResponseDto({
      id: permission.id,
      name: permission.name,
    });
  }

  async createPermission(createPermissionRequestDto: CreatePermissionRequestDto): Promise<PermissionResponseDto> {
    await this.permissionValidation.validateCreate(createPermissionRequestDto);
    const permissionId = await this.permissionRepository.create(
      new PermissionEntity(createPermissionRequestDto),
    );

    return await this.getPermissionById(permissionId);
  }

  async updatePermission(
    id: number,
    updatePermissionRequestDto: UpdatePermissionRequestDto,
  ): Promise<PermissionResponseDto> {
    await this.permissionValidation.validateUpdate(id, updatePermissionRequestDto);
    await this.permissionRepository.update(
      id,
      new PermissionEntity(updatePermissionRequestDto),
    );

    return await this.getPermissionById(id);
  }

  async deletePermission(id: number): Promise<void> {
    await this.permissionValidation.validateDelete(id);
    return this.permissionRepository.delete(id);
  }
}
