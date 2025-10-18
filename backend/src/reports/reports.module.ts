import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personel } from '../personel/personel.entity';
import { PersonalSecurityData } from '../personal-security-data/personal-security-data.entity';
import { SystemPermit } from 'src/system-permits/system-permit.entity';
import { System } from 'src/systems/system.entity';
import { SystemAccess } from 'src/system-access/system-access.entity';
import { Hardware } from 'src/hardware/hardware.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Personel,
      PersonalSecurityData,
      SystemPermit,
      System,
      SystemAccess,
      Hardware,
      User,
    ])
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
  // ==================== A JAVÍTÁS ====================
  // Ezzel tesszük a ReportsService-t elérhetővé más modulok számára.
  exports: [ReportsService],
  // ===================================================
})
export class ReportsModule {}