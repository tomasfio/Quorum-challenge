export class AuthResponseDto {
    id: string;
    name: string;
    email: string;
    password: string;
    roles: { roleId: number; name: string }[];
    permissions: { permissionId: number; name: string }[];
    
    constructor(props: Partial<AuthResponseDto> = {}) {
        Object.assign(this, props);
    }
}