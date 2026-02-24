import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  roles: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
