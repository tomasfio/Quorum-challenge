import { PermissionEntity } from "./permission.entity";
import { UserEntity } from "./user.entity";

export class RoleEntity {
  id: number;
  name: string;
  
  permissions: PermissionEntity[];
  users: UserEntity[];

  constructor(props: Partial<RoleEntity> = {}) {
    Object.assign(this, props);
  }
}