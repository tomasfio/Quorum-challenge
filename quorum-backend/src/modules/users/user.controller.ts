import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponseDto } from './dtos/user-response.dto';
import { CreateUserRequestDto } from './dtos/create-user-request.dto';
import { UpdateUserRequestDto } from './dtos/update-user-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { HasPermissions, HasRoles } from 'src/common/decorators/auth.decorator';
import { RolesGuard } from 'src/common/guards/role.guards';
import { ROLE_ADMIN } from 'src/shared/constants/role.constants';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(): Promise<UserResponseDto[]> {
    return await this.userService.getUsers();
  }

  @Get(':id')
  @HttpCode(200)
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.userService.getUserById(id);
  }

  @Post()
  @HttpCode(201)
  @HasRoles(ROLE_ADMIN)
  async createUser(
    @Body() createUserRequestDto: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    return await this.userService.createUser(createUserRequestDto);
  }

  @Patch(':id')
  @HttpCode(200)
  @HasRoles(ROLE_ADMIN)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return await this.userService.updateUser(id, updateUserRequestDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @HasRoles(ROLE_ADMIN)
  async deleteUser(@Param('id') id: string): Promise<void> {
    return await this.userService.deleteUser(id);
  }
}
