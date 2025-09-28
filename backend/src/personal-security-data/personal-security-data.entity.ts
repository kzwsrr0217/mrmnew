// mrmnew-show/backend/src/personal-security-data/personal-security-data.entity.ts

import { ClassificationLevel } from '../classifications/classification.entity';
import { Personel } from '../personel/personel.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, JoinColumn } from 'typeorm';

@Entity('personal_security_data')
export class PersonalSecurityData {
  @PrimaryGeneratedColumn()
  psd_id: number;

  @Column({ length: 255, nullable: true })
  beosztas: string;

  @Column({ length: 100, nullable: true })
  rendfokozat: string;

  @Column({ length: 100, nullable: true })
  titoktartasi_szam: string;

  @Column({ type: 'date', nullable: true })
  szbt_datum: Date;

  @Column({ type: 'date', nullable: true })
  szbt_lejarat: Date;

  @Column({ type: 'date', nullable: true })
  nato_datum: Date; // ÚJ MEZŐ

  @Column({ type: 'date', nullable: true })
  nato_lejarat: Date; // ÚJ MEZŐ

  @Column({ type: 'date', nullable: true })
  eu_datum: Date;

  @Column({ type: 'date', nullable: true })
  eu_lejarat: Date;

  @ManyToOne(() => ClassificationLevel, { nullable: true, eager: true })
  @JoinColumn({ name: 'nemzeti_szint_id' })
  nemzeti_szint: ClassificationLevel | null;

  @ManyToOne(() => ClassificationLevel, { nullable: true, eager: true })
  @JoinColumn({ name: 'nato_szint_id' })
  nato_szint: ClassificationLevel | null;

  @ManyToOne(() => ClassificationLevel, { nullable: true, eager: true })
  @JoinColumn({ name: 'eu_szint_id' })
  eu_szint: ClassificationLevel | null;

  @OneToOne(() => Personel, (personel) => personel.personal_security_data)
  personel: Personel;
}