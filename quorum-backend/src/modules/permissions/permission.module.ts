import { Module } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { PermissionRepository } from "./permission.repository";
import { PermissionService } from "./permission.service";
import { PermissionController } from "./permission.controller";
import { PermissionValidation } from "./permission.validation";

@Module({
  imports: [],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository, PrismaService, PermissionValidation],
})
export class PermissionModule {}
