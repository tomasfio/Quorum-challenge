import { ApiProperty } from "@nestjs/swagger";

export class PermissionResponseDto {
  @ApiProperty({ example: 1, description: "Permission id" })
  id: number;

  @ApiProperty({ example: "read", description: "Permission name" })
  name: string;

  constructor(permission: Partial<PermissionResponseDto>) {
    Object.assign(this, permission);
  }
}
