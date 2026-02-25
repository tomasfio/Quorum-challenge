import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserResponseDto } from './dtos/user-response.dto';
import { CreateUserRequestDto } from './dtos/create-user-request.dto';
import { UpdateUserRequestDto } from './dtos/update-user-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { HasPermissions, HasRoles } from 'src/common/decorators/auth.decorator';
import { RolesGuard } from 'src/common/guards/role.guards';
import { ROLE_ADMIN } from 'src/shared/constants/role.constants';

@ApiTags('users')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users', description: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users fetched successfully', type: [UserResponseDto] })
  async getUsers(): Promise<UserResponseDto[]> {
    return await this.userService.getUsers();
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get a user by id', description: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'User fetched successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.userService.getUserById(id);
  }

  @Post()
  @HttpCode(201)
  @HasRoles(ROLE_ADMIN)
  @ApiOperation({ summary: 'Create a user', description: 'Create a user with name, email, password, roles and permissions' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createUser(
    @Body() createUserRequestDto: CreateUserRequestDto,
  ): Promise<UserResponseDto> {
    return await this.userService.createUser(createUserRequestDto);
  }

  @Patch(':id')
  @HttpCode(200)
  @HasRoles(ROLE_ADMIN)
  @ApiOperation({ summary: 'Update a user', description: 'Update a user with name, email, roles and permissions' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    return await this.userService.updateUser(id, updateUserRequestDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @HasRoles(ROLE_ADMIN)
  @ApiOperation({ summary: 'Delete a user', description: 'Delete a user by id' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteUser(@Param('id') id: string): Promise<void> {
    return await this.userService.deleteUser(id);
  }
}
