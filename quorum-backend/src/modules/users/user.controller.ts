import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponseDto } from './dtos/user-response.dto';
import { CreateUserRequestDto } from './dtos/create-user-request.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(): Promise<UserResponseDto[]> {
    return await this.userService.getUsers();
  }

  @Post()
  async createUser(
    @Body() createUserRequestDto: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    return await this.userService.createUser(createUserRequestDto);
  }
}
