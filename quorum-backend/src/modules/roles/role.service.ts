import { Injectable, NotFoundException } from "@nestjs/common";
import { RoleEntity } from "src/entities/role.entity";
import { RoleRepository } from "./role.repository";
import { CreateRoleRequestDto } from "./dtos/create-role-request.dto";
import { UpdateRoleRequestDto } from "./dtos/update-role-request.dto";
import { RoleValidation } from "./role.validation";

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository, private readonly roleValidation: RoleValidation) {}

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
    const role = await this.roleRepository.create(new RoleEntity(createRoleRequestDto));
    return new RoleEntity(role);
  }

  async updateRole(id: number, updateRoleRequestDto: UpdateRoleRequestDto): Promise<RoleEntity> {
    await this.roleValidation.validateUpdate(id, updateRoleRequestDto);
    const role = await this.roleRepository.update(id, new RoleEntity(updateRoleRequestDto));
    return new RoleEntity(role);
  }

  async deleteRole(id: number): Promise<void> {
    await this.roleValidation.validateDelete(id);
    return this.roleRepository.delete(id);
  }
}   