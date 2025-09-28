// mrmnew-show/backend/src/system-access/system-access.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemAccess } from './system-access.entity';
import { SystemAccessController } from './system-access.controller';
import { SystemAccessService } from './system-access.service';
import { Personel } from '../personel/personel.entity'; // JAVÍTVA
import { System } from '../systems/system.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemAccess, Personel, System])], // JAVÍTVA
  controllers: [SystemAccessController],
  providers: [SystemAccessService],
})
export class SystemAccessModule {}