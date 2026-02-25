import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserRequestDto {
  @ApiProperty({ example: "John Doe", description: "User full name" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "user@example.com", description: "User email" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: ["CLIENT"], description: "Role names", type: [String], isArray: true })
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  roles: string[];

  @ApiPropertyOptional({ example: ["READ_CLIENTS", "WRITE_CLIENTS"], description: "Permission names", type: [String], isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
