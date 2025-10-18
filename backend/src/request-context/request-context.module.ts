// mrmnew/backend/src/request-context/request-context.module.ts
import { Global, Module } from '@nestjs/common'; // <-- JAVÍTVA: Global import
import { RequestContextService } from './request-context.service';

@Global() // <-- JAVÍTVA: Hozzáadva
@Module({
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class RequestContextModule {}