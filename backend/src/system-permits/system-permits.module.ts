// mrm-backend/src/system-permits/system-permits.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemPermitsController } from './system-permits.controller';
import { SystemPermitsService } from './system-permits.service';
import { SystemPermit } from './system-permit.entity';
import { System } from '../systems/system.entity';
import { ClassificationLevel } from '../classifications/classification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemPermit, System, ClassificationLevel]),
  ],
  controllers: [SystemPermitsController],
  providers: [SystemPermitsService],
})
export class SystemPermitsModule {}