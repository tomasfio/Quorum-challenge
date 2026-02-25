import { Controller, Get, Post, Param, Body, Delete, Patch, HttpCode, UseGuards } from "@nestjs/common";
import { RoleEntity } from "src/entities/role.entity";
import { RoleService } from "./role.service";
import { CreateRoleRequestDto } from "./dtos/create-role-request.dto";
import { UpdateRoleRequestDto } from "./dtos/update-role-request.dto";
import { HasRoles } from "src/common/decorators/auth.decorator";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/common/guards/role.guards";
import { ROLE_ADMIN } from "src/shared/constants/role.constants";

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @HttpCode(200)
  async getRoles(): Promise<RoleEntity[]> {
    return this.roleService.getRoles();
  }

  @Get(':id')
  @HttpCode(200)
  async getRoleById(@Param('id') id: number): Promise<RoleEntity> {
    return this.roleService.getRoleById(id);
  }

  @Post()
  @HttpCode(201)
  @HasRoles(ROLE_ADMIN)
  async createRole(@Body() createRoleRequestDto: CreateRoleRequestDto): Promise<RoleEntity> {
    return this.roleService.createRole(createRoleRequestDto);
  }

  @Patch(':id')
  @HttpCode(200)
  @HasRoles(ROLE_ADMIN)
  async updateRole(@Param('id') id: number, @Body() updateRoleRequestDto: UpdateRoleRequestDto): Promise<RoleEntity> {
    return this.roleService.updateRole(id, updateRoleRequestDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @HasRoles(ROLE_ADMIN)
  async deleteRole(@Param('id') id: number): Promise<void> {
    return this.roleService.deleteRole(id);
  }
}