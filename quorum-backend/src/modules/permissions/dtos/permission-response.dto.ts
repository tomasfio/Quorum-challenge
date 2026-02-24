export class PermissionResponseDto {
  id: number;
  name: string;

  constructor(permission: Partial<PermissionResponseDto>) {
    Object.assign(this, permission);
  }
}
