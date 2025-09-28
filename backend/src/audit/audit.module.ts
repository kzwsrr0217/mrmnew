import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditSubscriber } from './audit.subscriber';
import { User } from '../users/user.entity';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, User])],
  providers: [AuditSubscriber, AuditService],
  controllers: [AuditController],
})
export class AuditModule {}