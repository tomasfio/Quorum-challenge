import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from 'src/entities/user.entity';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';
import { UpdateUserRequestDto } from 'src/modules/users/dtos/update-user-request.dto';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class InMemoryUserRepository {
  private readonly users = new Map<string, StoredUser>();
  private readonly byEmail = new Map<string, string>(); // email -> id
  private idCounter = 1;

  async findByEmail(email: string): Promise<UserEntity | null> {
    const id = this.byEmail.get(email.toLowerCase());
    if (!id) return null;
    const u = this.users.get(id);
    return u ? new UserEntity(u) : null;
  }

  async getUsers(): Promise<UserResponseDto[]> {
    return Array.from(this.users.values()).map(
      (u) => new UserResponseDto({ id: u.id, name: u.name, email: u.email }),
    );
  }

  async getUserById(id: string): Promise<UserEntity> {
    const user = this.users.get(id);
    if (!user) throw new NotFoundException('User not found');
    return new UserEntity(user);
  }

  async createUser(user: UserEntity): Promise<UserEntity> {
    const id = `e2e-${this.idCounter++}`;
    const email = user.email.toLowerCase();
    if (this.byEmail.has(email)) {
      throw new Error('Email already in use');
    }
    const stored: StoredUser = {
      id,
      name: user.name,
      email: user.email,
      password: user.password,
    };
    this.users.set(id, stored);
    this.byEmail.set(email, id);
    return new UserEntity({
      id: stored.id,
      name: stored.name,
      email: stored.email,
    });
  }

  async updateUser(
    id: string,
    updateUserRequestDto: UpdateUserRequestDto,
  ): Promise<UserEntity> {
    const existing = this.users.get(id);
    if (!existing) throw new NotFoundException('User not found');
    if (updateUserRequestDto.email) {
      this.byEmail.delete(existing.email.toLowerCase());
      this.byEmail.set(updateUserRequestDto.email.toLowerCase(), id);
    }
    const updated: StoredUser = {
      ...existing,
      ...updateUserRequestDto,
    };
    this.users.set(id, updated);
    return new UserEntity({
      id: updated.id,
      name: updated.name,
      email: updated.email,
    });
  }

  async deleteUser(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) this.byEmail.delete(user.email.toLowerCase());
    this.users.delete(id);
  }

  seed(user: { id?: string; name: string; email: string; password?: string }): UserEntity {
    const id = user.id ?? `e2e-${this.idCounter++}`;
    const email = user.email.toLowerCase();
    if (this.byEmail.has(email)) {
      throw new Error(`Seed failed: email ${user.email} already in use`);
    }
    const stored: StoredUser = {
      id,
      name: user.name,
      email: user.email,
      password: user.password ?? '',
    };
    this.users.set(id, stored);
    this.byEmail.set(email, id);
    return new UserEntity({ id: stored.id, name: stored.name, email: stored.email });
  }

  async clear(): Promise<void> {
    this.users.clear();
    this.byEmail.clear();
    this.idCounter = 1;
  }
}
