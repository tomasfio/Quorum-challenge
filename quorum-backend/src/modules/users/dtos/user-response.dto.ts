import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "src/entities/user.entity";

export class UserResponseDto {
  @ApiProperty({ example: "uuid", description: "User id" })
  id: string;

  @ApiProperty({ example: "John Doe", description: "User full name" })
  name: string;

  @ApiProperty({ example: "user@example.com", description: "User email" })
  email: string;

  @ApiProperty({ example: ["CLIENT"], description: "Role names", type: [String], isArray: true })
  roles: string[];

  @ApiProperty({ example: ["READ_CLIENTS", "WRITE_CLIENTS"], description: "Permission names", type: [String], isArray: true })
  permissions: string[];

  constructor(user: Partial<UserResponseDto>) {
    Object.assign(this, user);
  }

  public static toUserResponseDto(user: UserEntity): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((role) => role.name),
      permissions: user.permissions.map((permission) => permission.name),
    });
  }
}
