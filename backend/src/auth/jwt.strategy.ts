import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  // A token validálása után ez a payload kerül a request objektumba (req.user)
async validate(payload: any) {
    // A payload tartalmazza a JWT dekódolt tartalmát,
    // amit az AuthService login metódusa tett bele.
    // Pl: { username: 'admin', sub: 1, role: 'Admin' }
    // A 'sub' (subject) általában a user ID-t tartalmazza.
    
    // JAVÍTVA: Visszaadjuk az ID-t is ('sub'-ként)
    return { id: payload.sub, username: payload.username, role: payload.role }; 
  }
}