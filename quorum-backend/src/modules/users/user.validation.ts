import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserRequestDto } from './dtos/create-user-request.dto';
import { UpdateUserRequestDto } from './dtos/update-user-request.dto';

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
    if (dto.email) {
      await this.ensureEmailNotTaken(dto.email, userId);
    }
    this.ensureRoleIsNotAdmin(dto.roles);
  }

  async validateDelete(id: string): Promise<void> {
    await this.ensureUserExists(id);
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
  
  private ensureRoleIsNotAdmin(roles: string[]): void {
    if (roles.includes('ADMIN')) {
      throw new BadRequestException('The role admin is not allowed to be assigned to a user');
    }
  }
}
