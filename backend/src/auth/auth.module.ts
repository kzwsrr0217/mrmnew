// mrmnew/backend/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
// RequestContextModule import már nem kell, mert Global
// JwtAuthGuard import már nem kell itt

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
    // RequestContextModule import már nem kell
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    // JwtAuthGuard kivéve a provider-ek közül
  ],
  controllers: [AuthController],
})
export class AuthModule {}