// mrmnew/backend/src/seeder/database-seeder.module.ts

import { Module } from '@nestjs/common';
import { DatabaseSeederService } from './database-seeder.service';
import { UsersModule } from '../users/users.module';
import { TestDataSeeder } from './test-data.seeder';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Software } from '../software/software.entity';
import { System } from '../systems/system.entity';
import { Hardware } from '../hardware/hardware.entity';
import { SystemPermit } from '../system-permits/system-permit.entity';
import { ClassificationLevel } from '../classifications/classification.entity';
import { Personel } from '../personel/personel.entity';
import { SystemAccess } from '../system-access/system-access.entity';
import { DatabaseSeederController } from './database-seeder.controller';
import { Ticket } from 'src/tickets/ticket.entity';
import { AccessRequest } from 'src/access-requests/access-request.entity';
import { LogisticsModule } from 'src/logistics/logistics.module';

// --- ÚJ IMPORTOK ---
import { LocationSeederService } from './locations.seeder';
import { DataHandlingPermitSeederService } from './data-handling-permits.seeder';
import { Location } from '../locations/location.entity';
import { DataHandlingPermit } from '../data-handling-permits/data-handling-permit.entity';

@Module({
  imports: [
    UsersModule,
    LogisticsModule,
    TypeOrmModule.forFeature([
      Software,
      System,
      Hardware,
      SystemPermit,
      ClassificationLevel,
      Personel,
      SystemAccess,
      Ticket,
      AccessRequest,
      // --- ÚJ ENTITÁSOK ---
      Location,
      DataHandlingPermit,
    ]),
  ],
  providers: [
    DatabaseSeederService, 
    TestDataSeeder,
    // --- ÚJ SZOLGÁLTATÁSOK ---
    LocationSeederService,
    DataHandlingPermitSeederService,
  ],
  controllers: [DatabaseSeederController],
})
export class DatabaseSeederModule {}