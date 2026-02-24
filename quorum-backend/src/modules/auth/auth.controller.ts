import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dtos/login-resquest.dto';
import { LoginResponseDto } from './dtos/login-response.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(200)
    @HttpCode(401)
    async login(@Body() loginRequestDto: LoginRequestDto) : Promise<LoginResponseDto> {
        return this.authService.login(loginRequestDto);
    }
}