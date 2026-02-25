import { ApiProperty } from "@nestjs/swagger";

export class RoleResponseDto {
  @ApiProperty({ example: 1, description: "Role id" })
  id: number;

  @ApiProperty({ example: "EDITOR", description: "Role name" })
  name: string;

  @ApiProperty({ example: ["READ_CLIENTS", "WRITE_CLIENTS"], description: "Permission names", type: [String], isArray: true })
  permissions: string[];

  constructor(role: Partial<RoleResponseDto>) {
    Object.assign(this, role);
  }
}