// mrmnew/backend/src/tickets/tickets.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { TicketComment } from './ticket-comment.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { User } from '../users/user.entity';
import { TicketAutomationService } from './ticket-automation.service';
import { SystemPermit } from '../system-permits/system-permit.entity';
import { PersonalSecurityData } from '../personal-security-data/personal-security-data.entity';
import { SystemAccess } from '../system-access/system-access.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      TicketComment,
      User,
      SystemPermit,
      PersonalSecurityData,
      SystemAccess,
    ]),
  ],
  providers: [TicketsService, TicketAutomationService],
  controllers: [TicketsController],
})
export class TicketsModule {}