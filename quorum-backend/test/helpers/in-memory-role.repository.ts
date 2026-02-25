import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionEntity } from 'src/entities/permission.entity';
import { RoleEntity } from 'src/entities/role.entity';
import { PermissionRepository } from 'src/modules/permissions/permission.repository';

interface StoredRole {
  id: number;
  name: string;
  permissionIds: number[];
}

@Injectable()
export class InMemoryRoleRepository {
  private readonly roles = new Map<number, StoredRole>();
  private readonly byName = new Map<string, number>();
  private idCounter = 1;

  constructor(private readonly permissionRepository: PermissionRepository) {}

  async getRoles(): Promise<RoleEntity[]> {
    const list: RoleEntity[] = [];
    for (const r of this.roles.values()) {
      const permissions = await this.resolvePermissionIds(r.permissionIds);
      list.push(new RoleEntity({ id: r.id, name: r.name, permissions }));
    }
    return list;
  }

  async findById(id: number | string): Promise<RoleEntity | null> {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const r = this.roles.get(numId);
    if (!r) return null;
    const permissions = await this.resolvePermissionIds(r.permissionIds);
    return new RoleEntity({ id: r.id, name: r.name, permissions });
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const id = this.byName.get(name.toLowerCase());
    if (id === undefined) return null;
    return this.findById(id);
  }

  async findManyByName(names: string[]): Promise<RoleEntity[]> {
    const ids = names.map((n) => this.byName.get(n.toLowerCase()));
    if (ids.some((id) => id === undefined)) {
      throw new NotFoundException('One or more roles not found');
    }
    return Promise.all((ids as number[]).map((id) => this.findById(id)!));
  }

  async create(role: RoleEntity): Promise<number> {
    const id = this.idCounter++;
    const name = role.name;
    if (this.byName.has(name.toLowerCase())) {
      throw new Error('Role name already in use');
    }
    const permissionIds = (role.permissions ?? []).map((p) => p.id);
    const stored: StoredRole = { id, name, permissionIds };
    this.roles.set(id, stored);
    this.byName.set(name.toLowerCase(), id);
    return id;
  }

  async update(id: number | string, role: RoleEntity): Promise<void> {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const existing = this.roles.get(numId);
    if (!existing) throw new NotFoundException('Role not found');
    existing.name = role.name;
    existing.permissionIds = (role.permissions ?? []).map((p) => p.id);
    this.byName.delete(existing.name.toLowerCase());
    this.byName.set(role.name.toLowerCase(), numId);
  }

  async delete(id: number | string): Promise<void> {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    const r = this.roles.get(numId);
    if (r) this.byName.delete(r.name.toLowerCase());
    this.roles.delete(numId);
  }

  seed(role: { id?: number; name: string; permissionIds?: number[] }): RoleEntity {
    const id = role.id ?? this.idCounter++;
    const name = role.name;
    if (this.byName.has(name.toLowerCase())) {
      throw new Error(`Seed failed: role name ${role.name} already in use`);
    }
    const stored: StoredRole = {
      id,
      name,
      permissionIds: role.permissionIds ?? [],
    };
    this.roles.set(id, stored);
    this.byName.set(name.toLowerCase(), id);
    return new RoleEntity({ id, name, permissions: [] });
  }

  async clear(): Promise<void> {
    this.roles.clear();
    this.byName.clear();
    this.idCounter = 1;
  }

  private async resolvePermissionIds(ids: number[]): Promise<PermissionEntity[]> {
    const result: PermissionEntity[] = [];
    for (const permissionId of ids) {
      const p = await this.permissionRepository.findById(permissionId);
      if (p) result.push(p);
    }
    return result;
  }
}
