import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { System } from 'src/systems/system.entity';
import { Ticket } from 'src/tickets/ticket.entity';
import { PortUnlockLog } from 'src/port-unlocking-log/port-unlock-log.entity';
import { AccessRequest } from 'src/access-requests/access-request.entity';
import { ReportsModule } from 'src/reports/reports.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      System,
      Ticket,
      PortUnlockLog,
      AccessRequest,
    ]),
    ReportsModule, // Hogy használhassuk a ReportsService-t
    AuditModule,   // Hogy használhassuk az AuditService-t
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}