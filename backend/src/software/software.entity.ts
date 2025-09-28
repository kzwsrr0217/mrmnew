// mrm-backend/src/software/software.entity.ts

import { Hardware } from '../hardware/hardware.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('software')
export class Software {
  @PrimaryGeneratedColumn()
  software_id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, nullable: true })
  version: string;

  // Kapcsolat a Hardware entitással (ennek a kapcsolatnak a "túloldala")
  @ManyToMany(() => Hardware, (hardware) => hardware.installed_software)
  hosts: Hardware[]; // A hardverek, amiken ez a szoftver telepítve van
}