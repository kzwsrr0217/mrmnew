import { Hardware } from '../hardware/hardware.entity';
import { DataHandlingPermit } from '../data-handling-permits/data-handling-permit.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';

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

  // Egyedi azonosító a könnyebb kereshetőségért
  @Column({ unique: true })
  full_address: string;

  @OneToMany(() => Hardware, hardware => hardware.location)
  hardware: Hardware[];

  @OneToOne(() => DataHandlingPermit, permit => permit.location)
  data_handling_permit: DataHandlingPermit;
}