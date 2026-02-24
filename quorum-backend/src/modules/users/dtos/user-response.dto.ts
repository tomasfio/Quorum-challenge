export class UserResponseDto {
  id: string;
  name: string;
  email: string;

  constructor(user: Partial<UserResponseDto>) {
    Object.assign(this, user);
  }
}
