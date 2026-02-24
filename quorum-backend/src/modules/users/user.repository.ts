import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserEntity } from 'src/entities/user.entity';
import { UserResponseDto } from './dtos/user-response.dto';
import { UpdateUserRequestDto } from './dtos/update-user-request.dto';
import { RoleEntity } from 'src/entities/role.entity';
import { PermissionEntity } from 'src/entities/permission.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    return user ? new UserEntity(user) : null;
  }

  async getUsers(): Promise<UserResponseDto[]> {
    const users = await this.prismaService.user.findMany();
    return users.map((user) => new UserResponseDto(user));
  }

  async getUserById(id: string): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
        permissions: { include: { permission: true } },
      },
    }) 

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = user.roles.map((role) => ({ id: role.roleId, name: role.role.name }));
    const permissions = [
      ...user.permissions.map((permission) => ({ id: permission.permissionId, name: permission.permission.name })),
      ...user.roles.flatMap((role) => role.role.permissions.map((permission) => ({ id: permission.permissionId, name: permission.permission.name }))),
    ];

    return new UserEntity({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: roles.map((role) => new RoleEntity(role)),
      permissions: user.permissions.map((permission) => new PermissionEntity(permission.permission)),
    });
  }

  async createUser(user: UserEntity): Promise<string> {
    const rolesNames = user.roles.map((role) => role.name);
    const permissionsNames = user.permissions.map((permission) => permission.name);

    const roles = await this.prismaService.role.findMany({
      where: {
        name: {
          in: rolesNames,
        },
      },
    });

    const permissions = await this.prismaService.permission.findMany({
      where: {
        name: {
          in: permissionsNames,
        },
      },
    });

    const createdUser = await this.prismaService.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        roles: {
          create: user.roles.map((role) => ({
            role: {
              connect: { id: role.id },
            },
          })),
        },
        permissions: {
          create: user.permissions.map((permission) => ({
            permission: {
              connect: { id: permission.id },
            },
          })),
        },
      },
    });

    return createdUser.id;
  }

  async updateUser(
    id: string,
    user: UserEntity,
  ): Promise<void> {
    await this.prismaService.user.update({
      where: { id },
      data: {
        name: user.name,
        email: user.email,
        roles: {
          deleteMany: {},
          create: user.roles.map((role) => ({
            role: {
              connect: { id: role.id },
            },
          })),
        },
        permissions: {
          deleteMany: {},
          create: user.permissions.map((permission) => ({
            permission: {
              connect: { id: permission.id },
            },
          })),
        },
      },
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.prismaService.user.delete({
      where: { id },
    });
  }
}
