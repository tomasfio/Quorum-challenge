import { ApiProperty } from "@nestjs/swagger";

export class PermissionResponseDto {
  @ApiProperty({ example: 1, description: "Permission id" })
  id: number;

  @ApiProperty({ example: "READ_CLIENTS", description: "Permission name" })
  name: string;

  constructor(permission: Partial<PermissionResponseDto>) {
    Object.assign(this, permission);
  }
}
