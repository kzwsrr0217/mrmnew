// mrmnew-show/backend/src/personal-security-data/personal-security-data.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalSecurityData } from './personal-security-data.entity';
// Nincs már szükség a User/Personel entitás importjára itt,
// mert a kapcsolatot a másik oldalról (PersonelModule) már definiáltuk.

@Module({
  imports: [TypeOrmModule.forFeature([PersonalSecurityData])],
})
export class PersonalSecurityDataModule {}