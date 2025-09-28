// mrmnew-show/backend/src/system-access/system-access.entity.ts

import { System } from '../systems/system.entity';
import { Personel } from '../personel/personel.entity'; // JAVÍTVA
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum AccessLevel {
  USER = 'user',
  RBF = 'rbf',
  RA = 'ra',
}

@Entity('system_access')
export class SystemAccess {
  @PrimaryGeneratedColumn()
  access_id: number;

  @Column({ type: 'enum', enum: AccessLevel, default: AccessLevel.USER })
  access_level: AccessLevel;

  @ManyToOne(() => Personel, (personel) => personel.system_accesses) // JAVÍTVA
  @JoinColumn({ name: 'personel_id' })
  personel: Personel; // JAVÍTVA

  @ManyToOne(() => System)
  @JoinColumn({ name: 'system_id' })
  system: System;
}