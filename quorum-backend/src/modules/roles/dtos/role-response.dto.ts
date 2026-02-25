import { ApiProperty } from "@nestjs/swagger";

export class RoleResponseDto {
  @ApiProperty({ example: 1, description: "Role id" })
  id: string;

  @ApiProperty({ example: "EDITOR", description: "Role name" })
  name: string;

  constructor(role: Partial<RoleResponseDto>) {
    Object.assign(this, role);
  }
}