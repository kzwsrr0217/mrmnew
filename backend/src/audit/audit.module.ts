// mrmnew/backend/src/audit/audit.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { User } from 'src/users/user.entity';
import { AuditSubscriber } from './audit.subscriber';
import { RequestContextModule } from 'src/request-context/request-context.module'; // <-- ÚJ IMPORT

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, User]),
    RequestContextModule, // <-- JAVÍTVA: Importáljuk
  ],
  providers: [
    AuditService,
    AuditSubscriber
  ],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}