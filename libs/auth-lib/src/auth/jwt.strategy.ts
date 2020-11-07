import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

const isPattern = (s: string, pattern: string): boolean => 
  s.substr(0, pattern.length) === pattern;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: true,
        passReqToCallback: true,
        secretOrKey: jwtConstants.secret,
      },
      (req, payload, next) => this.verify(req, payload, next)
    );
  }

  verify(req, payload, next) {
    let isOK = true;

    if (req.baseUrl === '/gql') {
      isOK = false;
      let i = -1;
      for (let pattern of ['query', 'mutation']) {
        i++;
        if (isOK = isPattern(req.body.query, pattern) && payload.permissions.substr(i, 1) === '1')
          break;
      }
    }

    return isOK
              ? next(null, { id: payload.sub, permissions: payload.permissions })
              : next('Unauthorized for this action', false);
  }
}
