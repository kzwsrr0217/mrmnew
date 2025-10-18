// mrmnew/backend/src/notifications/notifications.module.ts

import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/tickets/ticket.entity';
import { AccessRequest } from 'src/access-requests/access-request.entity';
// JAVÍTVA: Új entitások importálása
import { SystemPermit } from 'src/system-permits/system-permit.entity';
import { Personel } from 'src/personel/personel.entity';
import { PersonalSecurityData } from 'src/personal-security-data/personal-security-data.entity';

@Module({
  imports: [
    // JAVÍTVA: Új entitások hozzáadása a TypeOrm modulhoz
    TypeOrmModule.forFeature([
      Ticket, 
      AccessRequest, 
      SystemPermit, 
      Personel,
      PersonalSecurityData // Szükséges a Personel relációjához
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}