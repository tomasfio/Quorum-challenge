export class RoleResponseDto {
  id: string;
  name: string;

  constructor(role: Partial<RoleResponseDto>) {
    Object.assign(this, role);
  }
}