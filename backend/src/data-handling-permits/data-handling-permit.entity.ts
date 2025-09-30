// mrmnew/backend/src/data-handling-permits/data-handling-permit.entity.ts

import { ClassificationLevel } from '../classifications/classification.entity';
import { Location } from '../locations/location.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm'; // OneToOne és JoinColumn törölve, OneToMany hozzáadva

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

  // --- JAVÍTVA: OneToOne -> OneToMany ---
  @OneToMany(() => Location, location => location.dataHandlingPermit)
  locations: Location[]; // 'location'-ből 'locations' lett, és tömböt jelöl

  @ManyToMany(() => ClassificationLevel, { eager: true, cascade: true })
  @JoinTable({
      name: 'permit_classifications',
      joinColumn: { name: 'permit_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'classification_id', referencedColumnName: 'id' },
  })
  classification_levels: ClassificationLevel[];

  @Column({ nullable: true })
  file_path: string;

  @Column({ nullable: true })
  original_filename: string;
}