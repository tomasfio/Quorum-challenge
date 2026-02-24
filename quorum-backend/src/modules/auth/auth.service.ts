import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { LoginRequestDto } from './dtos/login-resquest.dto';
import { LoginResponseDto } from './dtos/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginRequestDto: LoginRequestDto) : Promise<LoginResponseDto> {
    const user = await this.authRepository.findByEmail(loginRequestDto.email);

    if (!user || !(await bcrypt.compare(loginRequestDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: this.jwtService.sign({
        sub: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((role) => role.name),
        permissions: user.permissions.map((permission) => permission.name),
      }),
    };
  }
}