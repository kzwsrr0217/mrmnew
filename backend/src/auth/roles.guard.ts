import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../users/user.entity';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // A dekorátorral megadott szükséges szerepkörök lekérdezése
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Ha egy végponthoz nincs szerepkör megadva, akkor mindenki hozzáférhet
    if (!requiredRoles) {
      return true;
    }

    // A bejelentkezett felhasználó adatainak lekérdezése a requestből
    const { user } = context.switchToHttp().getRequest();
    
    // Ellenőrizzük, hogy a felhasználó szerepköre benne van-e a szükséges szerepkörök listájában
    return requiredRoles.some((role) => user.role === role);
  }
}