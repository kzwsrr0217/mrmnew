// mrmnew/backend/src/auth/auth.controller.ts
import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any) {
    // A 'local' stratégia validálás után a req.user-hez csatolja a felhasználót
    const user = req.user;
    
    // Az AuthService legenerálja a tokent
    const tokenObject = await this.authService.login(user);

    // JAVÍTÁS: A token mellé a felhasználói adatokat is visszaküldjük
    return {
      ...tokenObject, // Ez tartalmazza az access_token-t
      user: user       // Hozzáadjuk a user objektumot is
    };
  }
}