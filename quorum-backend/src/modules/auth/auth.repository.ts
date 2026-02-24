import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { AuthResponseDto } from "./dtos/auth-response.dto";

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<AuthResponseDto | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
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
      return null;
    }

    const roles = user.roles.map((role) => ({ roleId: role.roleId, name: role.role.name }));
    const permissions = [
        ...user.permissions.map((permission) => ({ permissionId: permission.permissionId, name: permission.permission.name })),
        ...user.roles.flatMap((role) => role.role.permissions.map((permission) => ({ permissionId: permission.permissionId, name: permission.permission.name }))),
    ];

    return new AuthResponseDto({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      roles: roles,
      permissions: permissions,
    });
  }
}