// mrmnew/backend/src/locations/location.entity.ts

import { Hardware } from '../hardware/hardware.entity';
import { DataHandlingPermit } from '../data-handling-permits/data-handling-permit.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, AfterLoad } from 'typeorm';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  zip_code: string;

  @Column()
  city: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  building: string;

  @Column()
  room: string;

  // Ez a mező már nem lesz oszlop az adatbázisban.
  // A @AfterLoad hook tölti fel automatikusan.
  full_address: string;

  @AfterLoad()
  generateFullAddress() {
    this.full_address = `${this.zip_code} ${this.city}, ${this.address}, ${this.building} ép., ${this.room}`;
  }

  @OneToMany(() => Hardware, hardware => hardware.location)
  hardware: Hardware[];

  @OneToOne(() => DataHandlingPermit, permit => permit.location)
  data_handling_permit: DataHandlingPermit;
}