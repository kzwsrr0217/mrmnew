// mrmnew/backend/src/hardware/hardware.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hardware } from './hardware.entity';
import { System } from '../systems/system.entity';
import { ClassificationLevel } from '../classifications/classification.entity';
import { HardwareController } from './hardware.controller';
import { HardwareService } from './hardware.service';
import { Software } from '../software/software.entity';
import { Location } from '../locations/location.entity'; // <-- 1. ÚJ IMPORT

@Module({
  imports: [
    // 2. ADJUK HOZZÁ A LOCATION ENTITÁST
    TypeOrmModule.forFeature([Hardware, System, ClassificationLevel, Software, Location]),
  ],
  controllers: [HardwareController],
  providers: [HardwareService],
})
export class HardwareModule {}