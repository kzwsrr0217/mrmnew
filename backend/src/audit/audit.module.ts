import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditSubscriber } from './audit.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditController],
  providers: [AuditService, AuditSubscriber],
  // ==================== A JAVÍTÁS ====================
  // Ezzel tesszük az AuditService-t elérhetővé más modulok számára.
  exports: [AuditService],
  // ===================================================
})
export class AuditModule {}