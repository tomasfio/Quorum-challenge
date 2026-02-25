import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { PermissionEntity } from "src/entities/permission.entity";
import { RoleEntity } from "src/entities/role.entity";

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getRoles(): Promise<RoleEntity[]> {
    const roles = await this.prismaService.role.findMany();
    return roles.map((role) => new RoleEntity(role));
  }

  async findById(id: number): Promise<RoleEntity | null> {
    const role = await this.prismaService.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    return role ? new RoleEntity({
      id: role.id,
      name: role.name,
      permissions: role.permissions.map((permission) => new PermissionEntity(permission.permission)),
    }) : null;
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const role = await this.prismaService.role.findUnique({
      where: { name },
    });
    return role ? new RoleEntity(role) : null;
  }

  async findManyByName(names: string[]): Promise<RoleEntity[]> {
    const roles = await this.prismaService.role.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });

    if (roles.length !== names.length) {
      throw new NotFoundException('One or more roles not found');
    }
    
    return roles.map((role) => new RoleEntity(role));
  }

  async create(role: RoleEntity): Promise<number> {
    const createdRole = await this.prismaService.role.create({
      data: {
        name: role.name,
        permissions: {
          create: role.permissions.map((permission) => ({ permissionId: permission.id })),
        },
      },
    });
    return createdRole.id;
  }
  
  async update(id: number, role: RoleEntity): Promise<void> {
    await this.prismaService.role.update({
      where: { id },
      data: {
        name: role.name,
        permissions: {
          deleteMany: {},
          create: role.permissions.map((permission) => ({ permissionId: permission.id })),
        },
      },
    });
  }
  
  async delete(id: number): Promise<void> {
    await this.prismaService.role.delete({
    where: { id },
    });
  }
}