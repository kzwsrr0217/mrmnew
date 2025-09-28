// mrmnew/backend/src/access-requests/access-requests.module.ts

import { Module } from '@nestjs/common';
import { AccessRequestsController } from './access-requests.controller';
import { AccessRequestsService } from './access-requests.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessRequest } from './access-request.entity';
import { Personel } from 'src/personel/personel.entity';
import { System } from 'src/systems/system.entity';
import { SystemAccess } from 'src/system-access/system-access.entity';
import { User } from 'src/users/user.entity'; // <-- ÚJ IMPORT
import { AccessRequestsListener } from './access-requests-listener.service'; // <-- ÚJ IMPORT
import { Ticket } from 'src/tickets/ticket.entity'; // <-- ÚJ IMPORT




@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccessRequest,
      Personel,
      System,
      SystemAccess,
      User,
      Ticket, // <-- ÚJ IMPORT
    ]),
  ],
  controllers: [AccessRequestsController],
  providers: [AccessRequestsService, AccessRequestsListener] // <-- LISTENER HOZZÁADVA
})
export class AccessRequestsModule {}