// mrm-backend/src/system-permits/system-permit.entity.ts

import { ClassificationLevel } from '../classifications/classification.entity';
import { System } from '../systems/system.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';

@Entity('system_permits')
export class SystemPermit {
  @PrimaryGeneratedColumn()
  permit_id: number;

  @Column({ length: 100, unique: true })
  engedely_szam: string;

  @Column({ length: 100, nullable: true })
  kerelem_szam: string;

  @Column({ type: 'date' })
  kiallitas_datuma: Date;

  @Column({ type: 'date' })
  ervenyesseg_datuma: Date;

  @OneToOne(() => System, (system) => system.permit)
  @JoinColumn({ name: 'system_id' })
  system: System;

  // --- JAVÍTOTT TÍPUSDEFINÍCIÓK ---
  // A ': ClassificationLevel | null' a kulcs a TypeScript számára
  @ManyToOne(() => ClassificationLevel, { nullable: true, eager: true })
  @JoinColumn({ name: 'nemzeti_classification_id' })
  nemzeti_classification: ClassificationLevel | null;

  @ManyToOne(() => ClassificationLevel, { nullable: true, eager: true })
  @JoinColumn({ name: 'nato_classification_id' })
  nato_classification: ClassificationLevel | null;

  @ManyToOne(() => ClassificationLevel, { nullable: true, eager: true })
  @JoinColumn({ name: 'eu_classification_id' })
  eu_classification: ClassificationLevel | null;
}