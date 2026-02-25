import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreatePermissionRequestDto {
  @ApiProperty({ example: "READ_CLIENTS", description: "Permission name" })
  @IsString()
  @IsNotEmpty()
  name: string;
}
