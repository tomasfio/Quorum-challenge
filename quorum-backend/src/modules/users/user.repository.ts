import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserEntity } from 'src/entities/user.entity';
import { UserResponseDto } from './dtos/user-response.dto';
import { UpdateUserRequestDto } from './dtos/update-user-request.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    return user ? new UserEntity(user) : null;
  }

  async getUsers(): Promise<UserResponseDto[]> {
    const users = await this.prismaService.user.findMany();
    return users.map((user) => new UserResponseDto(user));
  }

  async getUserById(id: string): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserEntity({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  async createUser(user: UserEntity): Promise<UserEntity> {
    const createdUser = await this.prismaService.user.create({
      data: user,
    });

    return new UserEntity({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
    });
  }

  async updateUser(
    id: string,
    updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<UserEntity> {
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: updateUserRequestDto,
    });

    return new UserEntity({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.prismaService.user.delete({
      where: { id },
    });
  }
}
