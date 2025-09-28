// mrmnew/backend/src/data-handling-permits/data-handling-permit.entity.ts

import { ClassificationLevel } from '../classifications/classification.entity';
import { Location } from '../locations/location.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';

export enum SecurityClass {
  FIRST_CLASS = 'Első Osztály',
  SECOND_CLASS = 'Másod Osztály',
}

@Entity('data_handling_permits')
export class DataHandlingPermit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  registration_number: string;

  @Column({ type: 'enum', enum: SecurityClass })
  security_class: SecurityClass;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToOne(() => Location, location => location.data_handling_permit, { cascade: true })
  @JoinColumn()
  location: Location;

  @ManyToMany(() => ClassificationLevel, { eager: true, cascade: true })
  @JoinTable()
  classification_levels: ClassificationLevel[];

  // --- ÚJ MEZŐK A FÁJLFELTÖLTÉSHEZ ---
  @Column({ nullable: true })
  file_path: string;

  @Column({ nullable: true })
  original_filename: string;
}