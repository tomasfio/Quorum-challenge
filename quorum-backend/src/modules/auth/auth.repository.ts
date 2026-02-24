import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { PermissionEntity } from "src/entities/permission.entity";
import { RoleEntity } from "src/entities/role.entity";
import { UserEntity } from "src/entities/user.entity";

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: {
        roles: { include: { role: true } },
        permissions: { include: { permission: true } },
      },
    }) as UserEntity | null;

    return user ? new UserEntity(user) : null;
  }
}