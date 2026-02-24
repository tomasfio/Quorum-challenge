import { IsNotEmpty, IsString } from "class-validator";

export class CreatePermissionRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
