import { Injectable, NotFoundException } from "@nestjs/common";
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

  async findManyByName(names: string[]): Promise<PermissionEntity[]> {
    console.log(names);
    if (names.length === 0) {
      return [];
    }

    const permissions = await this.prismaService.permission.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });

    if (permissions.length !== names.length) {
      throw new NotFoundException('One or more permissions not found');
    }
    
    return permissions.map((permission) => new PermissionEntity(permission));
  }

  async create(permission: PermissionEntity): Promise<number> {
    const createdPermission = await this.prismaService.permission.create({
      data: {
        name: permission.name,
      },
    });
    return createdPermission.id;
  }

  async update(id: number, permission: PermissionEntity): Promise<void> {
    await this.prismaService.permission.update({
      where: { id },
      data: {
        name: permission.name,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prismaService.permission.delete({
      where: { id },
    });
  }
}
