// mrmnew/backend/src/locations/location.entity.ts

import { Hardware } from '../hardware/hardware.entity';
import { DataHandlingPermit } from '../data-handling-permits/data-handling-permit.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, AfterLoad } from 'typeorm'; // OneToOne törölve, ManyToOne és JoinColumn hozzáadva

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

  full_address: string;

  @AfterLoad()
  generateFullAddress() {
    this.full_address = `${this.zip_code} ${this.city}, ${this.address}, ${this.building || ''} ép., ${this.room}`;
  }

  @OneToMany(() => Hardware, hardware => hardware.location)
  hardware: Hardware[];

  // --- JAVÍTVA: OneToOne -> ManyToOne ---
  @ManyToOne(() => DataHandlingPermit, permit => permit.locations, {
    nullable: true, // Egy helyszín létezhet engedély nélkül
    onDelete: 'SET NULL', // Ha törlődik az engedély, a helyszín ne törlődjön, csak a kapcsolat szűnjön meg
  })
  @JoinColumn({ name: 'data_handling_permit_id' }) // Ez hozza létre a külső kulcs oszlopot
  dataHandlingPermit: DataHandlingPermit; // 'data_handling_permit'-ről átnevezve a konvencióknak megfelelően
}