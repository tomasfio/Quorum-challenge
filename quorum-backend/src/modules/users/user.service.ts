import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './user.repository';
import { UserResponseDto } from './dtos/user-response.dto';
import { CreateUserRequestDto } from './dtos/create-user-request.dto';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUsers(): Promise<UserResponseDto[]> {
    return await this.userRepository.getUsers();
  }

  async createUser(
    createUserRequestDto: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(createUserRequestDto.password, 10);
    const user = await this.userRepository.createUser(
      this.toUserEntity(createUserRequestDto, hashedPassword),
    );
    return new UserResponseDto(user);
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
