import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserRequestDto } from './dtos/create-user-request.dto';
import { UpdateUserRequestDto } from './dtos/update-user-request.dto';
import { ROLE_ADMIN } from 'src/shared/constants/role.constants';

@Injectable()
export class UsersValidation {
  constructor(private readonly userRepository: UserRepository) {}

  async validateCreate(dto: CreateUserRequestDto): Promise<void> {
    await this.ensureEmailNotTaken(dto.email);
    this.ensureStrongPassword(dto.password);
    this.ensureRoleIsNotAdmin(dto.roles);
  }

  async validateUpdate(
    userId: string,
    dto: UpdateUserRequestDto,
  ): Promise<void> {
    await this.ensureUserIsNotAdmin(userId);
    this.ensureRoleIsNotAdmin(dto.roles);
    if (dto.email) {
      await this.ensureEmailNotTaken(dto.email, userId);
    }
  }

  async validateDelete(id: string): Promise<void> {
    await this.ensureUserExists(id);
    await this.ensureUserIsNotAdmin(id);
  }

  private async ensureUserExists(id: string): Promise<void> {
    const existing = await this.userRepository.getUserById(id);
    if (!existing) {
      throw new NotFoundException('The user does not exist');
    }
  }

  private async ensureEmailNotTaken(email: string, excludeUserId?: string) {
    const existing = await this.userRepository.findByEmail(email);

    if (existing && existing.id !== excludeUserId) {
      throw new ConflictException('The email is already in use');
    }
  }

  private ensureStrongPassword(password: string) {
    const strong =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password);

    if (!strong) {
      throw new BadRequestException(
        'The password must be at least 8 characters, uppercase, lowercase and numbers',
      );
    }
  }

  private async ensureUserIsNotAdmin(userId: string): Promise<void> {
    const user = await this.userRepository.getUserById(userId);
    if (user.roles.some((role) => role.name === ROLE_ADMIN)) {
      throw new ForbiddenException('The user is an admin and cannot be modified');
    }
  } 
  
  private ensureRoleIsNotAdmin(roles: string[]): void {
    if (roles.includes(ROLE_ADMIN)) {
      throw new BadRequestException('The role admin is not allowed to be assigned to a user');
    }
  }
}
