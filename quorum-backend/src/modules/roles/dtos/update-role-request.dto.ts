import { IsNotEmpty, IsString } from "class-validator";

export class UpdateRoleRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}