// mrmnew/backend/src/seeder/database-seeder.module.ts

import { Module } from '@nestjs/common';
import { DatabaseSeederService } from './database-seeder.service';
import { UsersModule } from '../users/users.module';
import { TestDataSeeder } from './test-data.seeder'; // <-- ÚJ IMPORT
import { TypeOrmModule } from '@nestjs/typeorm';
import { Software } from '../software/software.entity';
import { System } from '../systems/system.entity';
import { Hardware } from '../hardware/hardware.entity';
import { SystemPermit } from '../system-permits/system-permit.entity';
import { ClassificationLevel } from '../classifications/classification.entity';
import { Personel } from '../personel/personel.entity';
import { SystemAccess } from '../system-access/system-access.entity';
import { DatabaseSeederController } from './database-seeder.controller'; // <-- ÚJ IMPORT
import { Ticket } from 'src/tickets/ticket.entity'; // <-- ÚJ IMPORT
import { AccessRequest } from 'src/access-requests/access-request.entity'; // <-- ÚJ IMPORT
import { LogisticsModule } from 'src/logistics/logistics.module'; // <-- ÚJ IMPORT

@Module({
  imports: [
    UsersModule,
    LogisticsModule, // <-- ÚJ IMPORT
    TypeOrmModule.forFeature([ // <-- Minden szükséges entitás importálása
      Software,
      System,
      Hardware,
      SystemPermit,
      ClassificationLevel,
      Personel,
      SystemAccess,
      Ticket, // <-- Ticket entitás hozzáadása
      AccessRequest, // <-- AccessRequest entitás hozzáadása
    ]),
  ],
  providers: [DatabaseSeederService, TestDataSeeder], // <-- TestDataSeeder hozzáadása
  controllers: [DatabaseSeederController], // <-- EZT A SORT ADD HOZZÁ

})
export class DatabaseSeederModule {}