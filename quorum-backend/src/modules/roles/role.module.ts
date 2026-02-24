import { Module } from "@nestjs/common";
import { PrismaService } from "src/database/prisma.service";
import { RoleRepository } from "./role.repository";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";
import { RoleValidation } from "./role.validation";

@Module({
  imports: [],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, PrismaService, RoleValidation],
})
export class RoleModule {}