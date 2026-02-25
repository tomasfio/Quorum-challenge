import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
  @ApiProperty({ example: "uuid", description: "User id" })
  id: string;

  @ApiProperty({ example: "John Doe", description: "User name" })
  name: string;

  @ApiProperty({ example: "user@example.com", description: "User email" })
  email: string;

  @ApiProperty({ description: "Hashed password" })
  password: string;

  @ApiProperty({
    type: "array",
    items: { type: "object", properties: { roleId: { type: "number" }, name: { type: "string" } } },
    description: "User roles",
  })
  roles: { roleId: number; name: string }[];

  @ApiProperty({
    type: "array",
    items: { type: "object", properties: { permissionId: { type: "number" }, name: { type: "string" } } },
    description: "User permissions",
  })
  permissions: { permissionId: number; name: string }[];

  constructor(props: Partial<AuthResponseDto> = {}) {
    Object.assign(this, props);
  }
}