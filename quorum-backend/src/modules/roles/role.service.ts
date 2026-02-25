import { Injectable, NotFoundException } from "@nestjs/common";
import { RoleEntity } from "src/entities/role.entity";
import { RoleRepository } from "./role.repository";
import { CreateRoleRequestDto } from "./dtos/create-role-request.dto";
import { UpdateRoleRequestDto } from "./dtos/update-role-request.dto";
import { RoleValidation } from "./role.validation";
import { PermissionEntity } from "src/entities/permission.entity";
import { PermissionRepository } from "../permissions/permission.repository";

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository, private readonly roleValidation: RoleValidation, private readonly permissionRepository: PermissionRepository) {}

  async getRoles(): Promise<RoleEntity[]> {
    return this.roleRepository.getRoles();
  }

  async getRoleById(id: number): Promise<RoleEntity> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async createRole(createRoleRequestDto: CreateRoleRequestDto): Promise<RoleEntity> {
    await this.roleValidation.validateCreate(createRoleRequestDto);
    const createRole = await this.toRoleEntity(createRoleRequestDto);
    const roleId = await this.roleRepository.create(createRole);
    return await this.getRoleById(roleId);
  }

  async updateRole(id: number, updateRoleRequestDto: UpdateRoleRequestDto): Promise<RoleEntity> {
    await this.roleValidation.validateUpdate(id, updateRoleRequestDto);
    const updateRole = await this.toUpdateRoleEntity(updateRoleRequestDto);
    await this.roleRepository.update(id, updateRole);
    return await this.getRoleById(id);
  }

  async deleteRole(id: number): Promise<void> {
    await this.roleValidation.validateDelete(id);
    return this.roleRepository.delete(id);
  }

  private async toRoleEntity(createRoleRequestDto: CreateRoleRequestDto): Promise<RoleEntity> {
    const permissions = await this.toPermissionEntities(createRoleRequestDto.permissions ?? []);
    return new RoleEntity({
      name: createRoleRequestDto.name,
      permissions: permissions,
    });
  }

  private async toUpdateRoleEntity(updateRoleRequestDto: UpdateRoleRequestDto): Promise<RoleEntity> {
    const permissions = await this.toPermissionEntities(updateRoleRequestDto.permissions ?? []);
    return new RoleEntity({
      name: updateRoleRequestDto.name,
      permissions: permissions,
    });
  }

  private async toPermissionEntities(permissions: string[]): Promise<PermissionEntity[]> {
    return await this.permissionRepository.findManyByName(permissions);
  }
}   