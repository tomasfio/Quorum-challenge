import { IsNotEmpty, IsString } from "class-validator";

export class CreateRoleRequestDto {
  @IsString()
  @IsNotEmpty() 
  name: string;
}