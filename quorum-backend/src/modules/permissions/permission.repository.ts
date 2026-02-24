import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { PermissionEntity } from "src/entities/permission.entity";

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getPermissions(): Promise<PermissionEntity[]> {
    const permissions = await this.prismaService.permission.findMany();
    return permissions.map((permission) => new PermissionEntity(permission));
  }

  async findById(id: number): Promise<PermissionEntity | null> {
    const permission = await this.prismaService.permission.findUnique({
      where: { id },
    });
    return permission ? new PermissionEntity(permission) : null;
  }

  async findByName(name: string): Promise<PermissionEntity | null> {
    const permission = await this.prismaService.permission.findUnique({
      where: { name },
    });
    return permission ? new PermissionEntity(permission) : null;
  }

  async create(permission: PermissionEntity): Promise<PermissionEntity> {
    const createdPermission = await this.prismaService.permission.create({
      data: {
        name: permission.name,
      },
    });
    return new PermissionEntity(createdPermission);
  }

  async update(id: number, permission: PermissionEntity): Promise<PermissionEntity> {
    const updatedPermission = await this.prismaService.permission.update({
      where: { id },
      data: {
        name: permission.name,
      },
    });
    return new PermissionEntity(updatedPermission);
  }

  async delete(id: number): Promise<void> {
    await this.prismaService.permission.delete({
      where: { id },
    });
  }
}
