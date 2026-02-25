import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginRequestDto {
  @ApiProperty({ example: "admin@example.com", description: "User email" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "secret", description: "User password", minLength: 1 })
  @IsString()
  @IsNotEmpty()
  password: string;
}