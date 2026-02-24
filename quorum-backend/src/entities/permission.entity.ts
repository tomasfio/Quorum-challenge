import { RoleEntity } from "./role.entity";
import { UserEntity } from "./user.entity";

export class PermissionEntity {
    id: number;
    name: string;
    
    roles: RoleEntity[];
    users: UserEntity[];

    constructor(props: Partial<PermissionEntity> = {}) {
        Object.assign(this, props);
    }
}