import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortUnlockLog } from './port-unlock-log.entity';
import { PortUnlockingLogController } from './port-unlocking-log.controller';
import { PortUnlockingLogService } from './port-unlocking-log.service';
import { User } from '../users/user.entity';
import { System } from '../systems/system.entity';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([PortUnlockLog, User, System]), AuditModule],
  controllers: [PortUnlockingLogController],
  providers: [PortUnlockingLogService],
})
export class PortUnlockingLogModule {}