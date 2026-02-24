import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/database/prisma.service';
import { UserRepository } from './user.repository';
import { UsersValidation } from './user.validation';
import { PermissionRepository } from '../permissions/permission.repository';
import { RoleRepository } from '../roles/role.repository';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaService, UsersValidation, RoleRepository, PermissionRepository],
})
export class UserModule {}
