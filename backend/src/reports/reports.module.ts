// mrmnew/backend/src/reports/reports.module.ts

import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personel } from '../personel/personel.entity';
import { PersonalSecurityData } from '../personal-security-data/personal-security-data.entity';
import { SystemPermit } from 'src/system-permits/system-permit.entity';
import { System } from 'src/systems/system.entity';
import { SystemAccess } from 'src/system-access/system-access.entity'; // <-- ÚJ IMPORT


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Personel,
      PersonalSecurityData,
      SystemPermit,
      System,
      SystemAccess, // <-- ÚJ IMPORT
    ])
  ],
  providers: [ReportsService],
  controllers: [ReportsController]
})
export class ReportsModule {}