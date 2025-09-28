// mrmnew-show/backend/src/personel/personel.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personel } from './personel.entity';
import { PersonelController } from './personel.controller';
import { PersonelService } from './personel.service';
import { PersonalSecurityData } from '../personal-security-data/personal-security-data.entity';
import { ClassificationLevel } from '../classifications/classification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Personel, PersonalSecurityData, ClassificationLevel])],
  controllers: [PersonelController],
  providers: [PersonelService],
})
export class PersonelModule {}