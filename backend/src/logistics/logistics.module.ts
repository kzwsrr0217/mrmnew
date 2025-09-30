// mrmnew/backend/src/logistics/logistics.module.ts

import { Module } from '@nestjs/common';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsItem } from './entities/logistics-item.entity';
import { LogisticsHandover } from './entities/logistics-handover.entity';
import { LogisticsSeeder } from './logistics.seeder';
import { Hardware } from 'src/hardware/hardware.entity'; // <-- ÚJ IMPORT
import { System } from 'src/systems/system.entity';     // <-- ÚJ IMPORT
import { ClassificationLevel } from '../classifications/classification.entity'; // JAVÍTÁS: Importálás

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LogisticsItem, 
      LogisticsHandover,
      Hardware, // <-- EZT A SORT ADD HOZZÁ
      System,
      ClassificationLevel,   // <-- EZT A SORT ADD HOZZÁ
    ]),
  ],
  controllers: [LogisticsController],
  providers: [LogisticsService, LogisticsSeeder],
  exports: [LogisticsService, LogisticsSeeder],
})
export class LogisticsModule {}