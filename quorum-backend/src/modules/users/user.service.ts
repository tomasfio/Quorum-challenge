import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { UserResponseDto } from './dtos/user-response.dto';
import { CreateUserRequestDto } from './dtos/create-user-request.dto';
import { UserEntity } from 'src/entities/user.entity';
import { UpdateUserRequestDto } from './dtos/update-user-request.dto';
import { UsersValidation } from './user.validation';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly usersValidation: UsersValidation,
  ) {}

  async getUsers(): Promise<UserResponseDto[]> {
    return await this.userRepository.getUsers();
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.getUserById(id);
    return new UserResponseDto(user);
  }

  async createUser(
    createUserRequestDto: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    await this.usersValidation.validateCreate(createUserRequestDto);
    const hashedPassword = await bcrypt.hash(createUserRequestDto.password, 10);
    const user = await this.userRepository.createUser(
      this.toUserEntity(createUserRequestDto, hashedPassword),
    );
    return new UserResponseDto(user);
  }

  async updateUser(
    id: string,
    updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    await this.usersValidation.validateUpdate(id, updateUserRequestDto);
    const user = await this.userRepository.updateUser(id, updateUserRequestDto);
    return new UserResponseDto(user);
  }

  async deleteUser(id: string): Promise<void> {
    await this.usersValidation.validateDelete(id);
    await this.userRepository.deleteUser(id);
  }

  private toUserEntity(
    createUserRequestDto: CreateUserRequestDto,
    hashedPassword: string,
  ): UserEntity {
    return new UserEntity({
      name: createUserRequestDto.name,
      email: createUserRequestDto.email,
      password: hashedPassword,
    });
  }
}
