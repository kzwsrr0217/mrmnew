// mrmnew/backend/src/data-handling-permits/data-handling-permits.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataHandlingPermitsService } from './data-handling-permits.service';
import { DataHandlingPermitsController } from './data-handling-permits.controller';
import { DataHandlingPermit } from './data-handling-permit.entity';
import { Location } from '../locations/location.entity';
import { ClassificationLevel } from '../classifications/classification.entity'; // <-- 1. ÚJ IMPORT

@Module({
  // 2. ADJUK HOZZÁ A CLASSIFICATIONLEVEL ENTITÁST
  imports: [TypeOrmModule.forFeature([DataHandlingPermit, Location, ClassificationLevel])],
  providers: [DataHandlingPermitsService],
  controllers: [DataHandlingPermitsController],
})
export class DataHandlingPermitsModule {}