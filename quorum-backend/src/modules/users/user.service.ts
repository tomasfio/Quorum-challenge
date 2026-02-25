import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { UserResponseDto } from './dtos/user-response.dto';
import { CreateUserRequestDto } from './dtos/create-user-request.dto';
import { UserEntity } from 'src/entities/user.entity';
import { UpdateUserRequestDto } from './dtos/update-user-request.dto';
import { UsersValidation } from './user.validation';
import { RoleRepository } from '../roles/role.repository';
import { PermissionRepository } from '../permissions/permission.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly usersValidation: UsersValidation,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async getUsers(): Promise<UserResponseDto[]> {
    return await this.userRepository.getUsers();
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.getUserById(id);
    return new UserResponseDto({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((role) => role.name),
      permissions: user.permissions.map((permission) => permission.name),
    });
  }

  async createUser(
    createUserRequestDto: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    await this.usersValidation.validateCreate(createUserRequestDto);
    const hashedPassword = await bcrypt.hash(createUserRequestDto.password, 10);
    const userId = await this.userRepository.createUser(
      await this.toUserEntity(createUserRequestDto, hashedPassword),
    );

    return await this.getUserById(userId);
  }

  async updateUser(
    id: string,
    updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    await this.usersValidation.validateUpdate(id, updateUserRequestDto);
    await this.userRepository.updateUser(
      id,
      await this.toUpdateUserEntity(id, updateUserRequestDto),
    );
    return await this.getUserById(id);
  }

  async deleteUser(id: string): Promise<void> {
    await this.usersValidation.validateDelete(id);
    await this.userRepository.deleteUser(id);
  }

  private async toUserEntity(
    createUserRequestDto: CreateUserRequestDto,
    hashedPassword: string,
  ): Promise<UserEntity> {
    const roles = await this.roleRepository.findManyByName(createUserRequestDto.roles);
    const permissions = await this.permissionRepository.findManyByName(createUserRequestDto.permissions ?? []);

    return new UserEntity({
      name: createUserRequestDto.name,
      email: createUserRequestDto.email,
      password: hashedPassword,
      roles: roles,
      permissions: permissions,
    });
  }
  private async toUpdateUserEntity(
    id: string,
    updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<UserEntity> {
    const roles = await this.roleRepository.findManyByName(updateUserRequestDto.roles);
    const permissions = await this.permissionRepository.findManyByName(updateUserRequestDto.permissions ?? []);

    return new UserEntity({
      id: id,
      name: updateUserRequestDto.name,
      email: updateUserRequestDto.email,
      roles: roles,
      permissions: permissions,
    });
  }
}
