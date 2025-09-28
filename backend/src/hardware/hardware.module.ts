// mrm-backend/src/hardware/hardware.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hardware } from './hardware.entity';
import { System } from '../systems/system.entity';
import { ClassificationLevel } from '../classifications/classification.entity';
import { HardwareController } from './hardware.controller';
import { HardwareService } from './hardware.service';
import { Software } from '../software/software.entity'; // <-- ÚJ IMPORT

@Module({
  imports: [
    TypeOrmModule.forFeature([Hardware, System, ClassificationLevel, Software]), // <-- SZOFTVER HOZZÁADVA
  ],
  controllers: [HardwareController],
  providers: [HardwareService],
})
export class HardwareModule {}