import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/database/prisma.service';
import { UserRepository } from './user.repository';
import { UsersValidation } from './user.validation';
import { PermissionModule } from '../permissions/permission.module';
import { RoleModule } from '../roles/role.module';

@Module({
  imports: [RoleModule, PermissionModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaService, UsersValidation],
})
export class UserModule {}
