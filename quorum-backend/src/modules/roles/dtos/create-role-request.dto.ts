import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRoleRequestDto {
  @ApiProperty({ example: "EDITOR", description: "Role name" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: ["read", "write"], description: "Permission names", type: [String], isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}