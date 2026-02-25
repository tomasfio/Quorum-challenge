import { Module } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { RoleRepository } from "./role.repository";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";
import { RoleValidation } from "./role.validation";
import { PermissionRepository } from "../permissions/permission.repository";

@Module({
  imports: [],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, PrismaService, RoleValidation, PermissionRepository],
})
export class RoleModule {}