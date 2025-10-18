// mrmnew/backend/src/request-context/request-context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestContextService } from './request-context.service';
// A User import már nem szükséges itt

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly contextService: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // JAVÍTVA: Csak elindítjuk a kontextust (null userrel).
    // A Guard fogja feltölteni, ha a felhasználó be van jelentkezve.
    this.contextService.run(next);
  }
}