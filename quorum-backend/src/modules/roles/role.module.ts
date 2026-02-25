import { Module } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { RoleRepository } from "./role.repository";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";
import { RoleValidation } from "./role.validation";
import { PermissionModule } from "../permissions/permission.module";

@Module({
  imports: [PermissionModule],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, PrismaService, RoleValidation],
  exports: [RoleRepository],
})
export class RoleModule {}