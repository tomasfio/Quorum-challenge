import { UserEntity } from "src/entities/user.entity";

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  roles: string[];
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
