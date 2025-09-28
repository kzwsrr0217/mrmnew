// mrmnew/backend/src/data-handling-permits/data-handling-permits.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataHandlingPermitsService } from './data-handling-permits.service';
import { DataHandlingPermitsController } from './data-handling-permits.controller';
import { DataHandlingPermit } from './data-handling-permit.entity';
import { Location } from '../locations/location.entity'; // <-- 1. Importáld a Location entitást

@Module({
  imports: [TypeOrmModule.forFeature([DataHandlingPermit, Location])], // Ezt a sort kell hozzáadni!
  providers: [DataHandlingPermitsService],
  controllers: [DataHandlingPermitsController],
})
export class DataHandlingPermitsModule {}