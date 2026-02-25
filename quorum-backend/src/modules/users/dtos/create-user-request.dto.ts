import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  IsArray,
  IsOptional,
} from "class-validator";

export class CreateUserRequestDto {
  @ApiProperty({ example: "John Doe", description: "User full name" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "user@example.com", description: "User email" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "SecurePass123", description: "Password (8-32 chars, uppercase, lowercase, numbers)", minLength: 8, maxLength: 32 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @ApiProperty({ example: ["EDITOR"], description: "Role names", type: [String], isArray: true })
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  roles: string[];

  @ApiPropertyOptional({ example: ["read", "write"], description: "Permission names", type: [String], isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
