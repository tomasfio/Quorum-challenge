import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; roles?: string[]; permissions?: string[] }) {
    console.log(payload);
    return {
      userId: payload.sub,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };
  }
}