import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionEntity } from 'src/entities/permission.entity';

interface StoredPermission {
  id: number;
  name: string;
}

@Injectable()
export class InMemoryPermissionRepository {
  private readonly permissions = new Map<number, StoredPermission>();
  private readonly byName = new Map<string, number>();
  private idCounter = 1;

  async getPermissions(): Promise<PermissionEntity[]> {
    return Array.from(this.permissions.values()).map(
      (p) => new PermissionEntity({ id: p.id, name: p.name }),
    );
  }

  async findById(id: number | string): Promise<PermissionEntity | null> {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const p = this.permissions.get(numId);
    return p ? new PermissionEntity(p) : null;
  }

  async findByName(name: string): Promise<PermissionEntity | null> {
    const id = this.byName.get(name.toLowerCase());
    if (!id) return null;
    const p = this.permissions.get(id);
    return p ? new PermissionEntity(p) : null;
  }

  async findManyByName(names: string[]): Promise<PermissionEntity[]> {
    if (names.length === 0) return [];
    const found = names.map((name) => this.byName.get(name.toLowerCase()));
    if (found.some((id) => id === undefined)) {
      throw new NotFoundException('One or more permissions not found');
    }
    return (found as number[]).map((id) => {
      const p = this.permissions.get(id)!;
      return new PermissionEntity(p);
    });
  }

  async create(permission: PermissionEntity): Promise<number> {
    const id = this.idCounter++;
    const name = permission.name;
    if (this.byName.has(name.toLowerCase())) {
      throw new Error('Permission name already in use');
    }
    const stored: StoredPermission = { id, name };
    this.permissions.set(id, stored);
    this.byName.set(name.toLowerCase(), id);
    return id;
  }

  async update(id: number | string, permission: PermissionEntity): Promise<void> {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const existing = this.permissions.get(numId);
    if (!existing) throw new NotFoundException('Permission not found');
    this.byName.delete(existing.name.toLowerCase());
    const name = permission.name;
    if (this.byName.has(name.toLowerCase())) {
      this.byName.set(existing.name.toLowerCase(), id);
      throw new Error('Permission name already in use');
    }
    existing.name = name;
    this.byName.set(name.toLowerCase(), id);
  }

  async delete(id: number | string): Promise<void> {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const p = this.permissions.get(numId);
    if (p) this.byName.delete(p.name.toLowerCase());
    this.permissions.delete(numId);
  }

  seed(permission: { id?: number; name: string }): PermissionEntity {
    const id = permission.id ?? this.idCounter++;
    const name = permission.name;
    if (this.byName.has(name.toLowerCase())) {
      throw new Error(`Seed failed: permission name ${permission.name} already in use`);
    }
    const stored: StoredPermission = { id, name };
    this.permissions.set(id, stored);
    this.byName.set(name.toLowerCase(), id);
    return new PermissionEntity({ id, name });
  }

  async clear(): Promise<void> {
    this.permissions.clear();
    this.byName.clear();
    this.idCounter = 1;
  }
}
