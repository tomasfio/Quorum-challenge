import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserEntity } from 'src/entities/user.entity';
import { UserResponseDto } from './dtos/user-response.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getUsers(): Promise<UserResponseDto[]> {
    const users = await this.prismaService.user.findMany();
    return users.map((user) => new UserResponseDto(user));
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
}
