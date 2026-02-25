import { Controller, Get, Post, Param, Body, Delete, Patch, HttpCode, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RoleEntity } from "src/entities/role.entity";
import { RoleService } from "./role.service";
import { CreateRoleRequestDto } from "./dtos/create-role-request.dto";
import { UpdateRoleRequestDto } from "./dtos/update-role-request.dto";
import { HasRoles } from "src/common/decorators/auth.decorator";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/common/guards/role.guards";
import { ROLE_ADMIN } from "src/shared/constants/role.constants";
import { RoleResponseDto } from "./dtos/role-response.dto";

@ApiTags('roles')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all roles', description: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles fetched successfully', type: [RoleResponseDto] }) 
  async getRoles(): Promise<RoleResponseDto[]> {
    return this.roleService.getRoles();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by id', description: 'Get a role by id' })
  @ApiResponse({ status: 200, description: 'Role fetched successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async getRoleById(@Param('id') id: number): Promise<RoleResponseDto> {
    return this.roleService.getRoleById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a role', description: 'Create a role with name and permissions' })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @HasRoles(ROLE_ADMIN)
  async createRole(@Body() createRoleRequestDto: CreateRoleRequestDto): Promise<RoleResponseDto> {
    return this.roleService.createRole(createRoleRequestDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role', description: 'Update a role with name and permissions' })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @HasRoles(ROLE_ADMIN)
  async updateRole(@Param('id') id: number, @Body() updateRoleRequestDto: UpdateRoleRequestDto): Promise<RoleResponseDto> {
    return this.roleService.updateRole(id, updateRoleRequestDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a role', description: 'Delete a role by id' })
  @ApiResponse({ status: 204, description: 'Role deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @HasRoles(ROLE_ADMIN)
  async deleteRole(@Param('id') id: number): Promise<void> {
    return this.roleService.deleteRole(id);
  }
}