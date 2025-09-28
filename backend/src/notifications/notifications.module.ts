// mrmnew/backend/src/notifications/notifications.module.ts

import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/tickets/ticket.entity';
import { AccessRequest } from 'src/access-requests/access-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, AccessRequest])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}