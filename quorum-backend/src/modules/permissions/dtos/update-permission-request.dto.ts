import { IsNotEmpty, IsString } from "class-validator";

export class UpdatePermissionRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
