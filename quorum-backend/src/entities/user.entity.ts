import { User } from '@prisma/client';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';

export class UserEntity implements User {
  id: string;
  name: string;
  email: string;
  password: string;

  roles: RoleEntity[];
  permissions: PermissionEntity[];

  constructor(props: Partial<UserEntity> = {}) {
    Object.assign(this, props);
  }
}
