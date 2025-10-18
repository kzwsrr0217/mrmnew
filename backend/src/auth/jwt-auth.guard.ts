// mrmnew/backend/src/auth/jwt-auth.guard.ts

import { Injectable, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common'; // <-- JAVÍTVA: Inject hozzáadva
import { AuthGuard } from '@nestjs/passport';
import { RequestContextService } from 'src/request-context/request-context.service';
import { ModuleRef } from '@nestjs/core'; // <-- JAVÍTVA: AppContext helyett ModuleRef
import { Logger } from '@nestjs/common'; // <-- ÚJ IMPORT

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);
  // JAVÍTVA: Injektáljuk a ModuleRef-et
  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }

  // A handleRequest előtt lefutó canActivate-et használjuk, hogy biztosan hozzáférjünk a service-hez
async canActivate(context: ExecutionContext): Promise<boolean> {
    const can = (await super.canActivate(context)) as boolean;
    if (!can) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user) {
       try {
         const contextService = this.moduleRef.get(RequestContextService, { strict: false });
         if (contextService) {
           // --- JAVÍTVA: Logolás hozzáadása ---
           this.logger.log(`Setting user context for user ID: ${user.id} (${user.username})`);
           contextService.setUser(user);
           // ---------------------------------
         } else {
             this.logger.error('Nem sikerült lekérni a RequestContextService-t a JwtAuthGuardban (canActivate).');
         }
       } catch (contextError) {
         this.logger.error("Hiba a felhasználói kontextus beállítása közben (canActivate):", contextError);
       }
    } else {
        // Ha valamiért nincs user a requestben a sikeres canActivate után
        this.logger.warn("JwtAuthGuard.canActivate sikeres volt, de a request.user üres.");
    }

    return true;
  }


  // A handleRequest továbbra is szükséges, de a context beállítást már a canActivate elvégezte
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Ismeretlen hiba vagy nincs jogosultság');
    }
    // A contextService.setUser(user) hívás már nem itt van
    return user;
  }
}