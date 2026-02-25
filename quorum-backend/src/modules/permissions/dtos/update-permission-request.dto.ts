import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdatePermissionRequestDto {
  @ApiProperty({ example: "read", description: "Permission name" })
  @IsString()
  @IsNotEmpty()
  name: string;
}
