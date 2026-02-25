import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateRoleRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}