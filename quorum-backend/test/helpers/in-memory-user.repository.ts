import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from 'src/entities/user.entity';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';
import { RoleEntity } from 'src/entities/role.entity';
import { PermissionEntity } from 'src/entities/permission.entity';

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  roleNames: string[];
  permissionNames: string[];
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
      (u) => new UserResponseDto({
        id: u.id,
        name: u.name,
        email: u.email,
        roles: u.roleNames ?? [],
        permissions: u.permissionNames ?? [],
      }),
    );
  }

  async getUserById(id: string): Promise<UserEntity> {
    const user = this.users.get(id);
    if (!user) throw new NotFoundException('User not found');
    const roles = (user.roleNames ?? []).map((name) => new RoleEntity({ name }));
    const permissions = (user.permissionNames ?? []).map((name) => new PermissionEntity({ name }));
    return new UserEntity({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      roles,
      permissions,
    });
  }

  async createUser(user: UserEntity): Promise<string> {
    const id = `e2e-${this.idCounter++}`;
    const email = user.email.toLowerCase();
    if (this.byEmail.has(email)) {
      throw new Error('Email already in use');
    }
    const roleNames = (user.roles ?? []).map((r) => r.name);
    const permissionNames = (user.permissions ?? []).map((p) => p.name);
    const stored: StoredUser = {
      id,
      name: user.name,
      email: user.email,
      password: user.password,
      roleNames,
      permissionNames,
    };
    this.users.set(id, stored);
    this.byEmail.set(email, id);
    return id;
  }

  async updateUser(id: string, user: UserEntity): Promise<void> {
    const existing = this.users.get(id);
    if (!existing) throw new NotFoundException('User not found');
    if (user.email) {
      this.byEmail.delete(existing.email.toLowerCase());
      this.byEmail.set(user.email.toLowerCase(), id);
    }
    const roleNames = (user.roles ?? []).map((r) => r.name);
    const permissionNames = (user.permissions ?? []).map((p) => p.name);
    const updated: StoredUser = {
      ...existing,
      name: user.name ?? existing.name,
      email: user.email ?? existing.email,
      roleNames,
      permissionNames,
    };
    this.users.set(id, updated);
  }

  async deleteUser(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) this.byEmail.delete(user.email.toLowerCase());
    this.users.delete(id);
  }

  seed(user: {
    id?: string;
    name: string;
    email: string;
    password?: string;
    roles?: string[];
    permissions?: string[];
  }): UserEntity {
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
      roleNames: user.roles ?? [],
      permissionNames: user.permissions ?? [],
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
