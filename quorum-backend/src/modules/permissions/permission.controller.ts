import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Patch,
  HttpCode,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PermissionEntity } from "src/entities/permission.entity";
import { PermissionService } from "./permission.service";
import { CreatePermissionRequestDto } from "./dtos/create-permission-request.dto";
import { UpdatePermissionRequestDto } from "./dtos/update-permission-request.dto";
import { HasRoles } from "src/common/decorators/auth.decorator";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/common/guards/role.guards";
import { ROLE_ADMIN } from "src/shared/constants/role.constants";
import { PermissionResponseDto } from "./dtos/permission-response.dto";

@ApiTags('permissions')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all permissions', description: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'Permissions fetched successfully', type: [PermissionResponseDto] })
  async getPermissions(): Promise<PermissionResponseDto[]> {
    return this.permissionService.getPermissions();
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get a permission by id', description: 'Get a permission by id' })
  @ApiResponse({ status: 200, description: 'Permission fetched successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async getPermissionById(@Param('id') id: number): Promise<PermissionResponseDto> {
    return this.permissionService.getPermissionById(id);
  }

  @Post()
  @HttpCode(201)
  @HasRoles(ROLE_ADMIN)
  @ApiOperation({ summary: 'Create a permission', description: 'Create a permission with name' })
  @ApiResponse({ status: 201, description: 'Permission created successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createPermission(
    @Body() createPermissionRequestDto: CreatePermissionRequestDto,
  ): Promise<PermissionEntity> {
    return this.permissionService.createPermission(createPermissionRequestDto);
  }

  @Patch(':id')
  @HttpCode(200)
  @HasRoles(ROLE_ADMIN)
  @ApiOperation({ summary: 'Update a permission', description: 'Update a permission with name' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully', type: PermissionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updatePermission(
    @Param('id') id: number,
    @Body() updatePermissionRequestDto: UpdatePermissionRequestDto,
  ): Promise<PermissionEntity> {
    return this.permissionService.updatePermission(id, updatePermissionRequestDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a permission', description: 'Delete a permission by id' })
  @ApiResponse({ status: 204, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @HasRoles(ROLE_ADMIN)
  async deletePermission(@Param('id') id: number): Promise<void> {
    return this.permissionService.deletePermission(id);
  }
}
