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
import { PermissionEntity } from "src/entities/permission.entity";
import { PermissionService } from "./permission.service";
import { CreatePermissionRequestDto } from "./dtos/create-permission-request.dto";
import { UpdatePermissionRequestDto } from "./dtos/update-permission-request.dto";
import { HasRoles } from "src/common/decorators/auth.decorator";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/common/guards/role.guards";

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @HttpCode(200)
  async getPermissions(): Promise<PermissionEntity[]> {
    return this.permissionService.getPermissions();
  }

  @Get(':id')
  @HttpCode(200)
  async getPermissionById(@Param('id') id: number): Promise<PermissionEntity> {
    return this.permissionService.getPermissionById(id);
  }

  @Post()
  @HttpCode(201)
  @HasRoles('admin')
  async createPermission(
    @Body() createPermissionRequestDto: CreatePermissionRequestDto,
  ): Promise<PermissionEntity> {
    return this.permissionService.createPermission(createPermissionRequestDto);
  }

  @Patch(':id')
  @HttpCode(200)
  @HasRoles('admin')
  async updatePermission(
    @Param('id') id: number,
    @Body() updatePermissionRequestDto: UpdatePermissionRequestDto,
  ): Promise<PermissionEntity> {
    return this.permissionService.updatePermission(id, updatePermissionRequestDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @HasRoles('admin')
  async deletePermission(@Param('id') id: number): Promise<void> {
    return this.permissionService.deletePermission(id);
  }
}
