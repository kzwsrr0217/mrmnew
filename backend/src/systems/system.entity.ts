// backend/src/systems/system.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany
} from 'typeorm';
import { SystemPermit } from '../system-permits/system-permit.entity';
import { Hardware } from 'src/hardware/hardware.entity';
import { Document } from '../documents/document.entity';

export enum SystemStatus {
  AKTIV = 'Aktív',
  FEJLESZTES_ALATT = 'Fejlesztés alatt',
  INAKTIV = 'Inaktív',
  ARCHIVALT = 'Archivált',
}

@Entity('systems') // A tábla neve az adatbázisban: 'systems'
export class System {
  @PrimaryGeneratedColumn()
  systemid: number;

  @Column({ length: 255, unique: true })
  systemname: string;

  @Column({ length: 255, unique: false })
  description: string;

  @Column({
    type: 'enum',
    enum: SystemStatus, // Itt használjuk az enumot
    default: SystemStatus.FEJLESZTES_ALATT,
  })
  status: SystemStatus; // A típus is legyen az enum

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => SystemPermit, (permit) => permit.system, { cascade: true })
  permit: SystemPermit;
  @OneToMany(() => Hardware, (hardware) => hardware.system)
  hardware_components: Hardware[];

  @OneToMany(() => Document, (document) => document.system)
  documents: Document[];
}
