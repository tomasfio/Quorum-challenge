import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
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
    });

    return role ? new RoleEntity(role) : null;
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const role = await this.prismaService.role.findUnique({
      where: { name },
    });
    return role ? new RoleEntity(role) : null;
  }

  async create(role: RoleEntity): Promise<RoleEntity> {
    const createdRole = await this.prismaService.role.create({
      data: {
        name: role.name,
      },
    });
    return new RoleEntity(createdRole);
  }
  
  async update(id: number, role: RoleEntity): Promise<RoleEntity> {
    const updatedRole = await this.prismaService.role.update({
      where: { id },
      data: {
        name: role.name,
      },
    });
    return new RoleEntity(updatedRole);
  }
  
  async delete(id: number): Promise<void> {
    await this.prismaService.role.delete({
    where: { id },
    });
  }
}