// mrm-backend/src/hardware/hardware.entity.ts

import { System } from '../systems/system.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { ClassificationLevel } from '../classifications/classification.entity';
import { Software } from '../software/software.entity';
import { Location } from '../locations/location.entity';
// Főtípusok
export enum HardwareType {
  SZERVER = 'SZERVER',
  MUNKAALLOMAS = 'MUNKAÁLLOMÁS',
  SWITCH = 'SWITCH',
  ROUTER = 'ROUTER',
  ADATTAROLO = 'ADATTÁROLÓ',
  NYOMTATO = 'NYOMTATÓ',
  MONITOR = 'MONITOR',
  BILLENTYUZET = 'BILLENTYŰZET',
  EGER = 'EGÉR',
  RESZEGYSEG = 'RÉSZEGYSÉG',
  EGYEB = 'EGYÉB',
}

// Munkaállomás altípusok
export enum WorkstationType {
  ASZTALI = 'ASZTALI',
  HORDOZHATO = 'HORDOZHATÓ',
  THIN_CLIENT = 'THIN CLIENT',
  EGYEB = 'EGYÉB',
}

// Adattároló altípusok
export enum StorageType {
  SSD = 'SSD',
  HDD = 'HDD',
  NVME = 'NVME',
  SZALAG = 'SZALAG',
  EGYEB = 'EGYÉB',
}

export enum TempestLevel { A = 'LEVEL A', B = 'LEVEL B', C = 'LEVEL C' }

@Entity('hardware')
export class Hardware {
  @PrimaryGeneratedColumn()
  hardware_id: number;

  // Alap adatok
  @Column({ type: 'enum', enum: HardwareType })
  type: HardwareType;
  @Column({ length: 100, nullable: true })
  manufacturer: string;
  @Column({ length: 255 })
  model_name: string;
  @Column({ length: 255, unique: true })
  serial_number: string;
  @Column({ type: 'text', nullable: true })
  notes: string;

  // TEMPEST adatok (CSAK EGYSZER)
  @Column({ type: 'boolean', default: false })
  is_tempest: boolean;
  @Column({ length: 100, nullable: true })
  tempest_number: string;
  @Column({ length: 100, nullable: true })
  tempest_cert_number: string;
  @Column({ type: 'enum', enum: TempestLevel, nullable: true })
  tempest_level: TempestLevel;

  // Típus-specifikus adatok
  @Column({ type: 'enum', enum: WorkstationType, nullable: true })
  workstation_type: WorkstationType;
  @Column({ length: 100, unique: true, nullable: true })
  inventory_number: string;
  @Column({ type: 'int', nullable: true })
  storage_size_gb: number;
  @Column({ type: 'enum', enum: StorageType, nullable: true })
  storage_type: StorageType;

  // Kapcsolatok
  @ManyToOne(() => System, (system) => system.hardware_components)
  @JoinColumn({ name: 'system_id' })
  system: System;
  
  @ManyToMany(() => ClassificationLevel)
  @JoinTable({ name: 'hardware_classifications', /* ... */ })
  classifications: ClassificationLevel[];

  @ManyToOne(() => Hardware, (hardware) => hardware.child_components, { nullable: true })
  @JoinColumn({ name: 'parent_hardware_id' })
  parent_hardware: Hardware;

  @OneToMany(() => Hardware, (hardware) => hardware.parent_hardware)
  child_components: Hardware[];

  // --- ÚJ KAPCSOLAT A SZOFTVEREKHEZ ---
@ManyToMany(() => Software, (software) => software.hosts, { cascade: true })
@JoinTable({
  name: 'hardware_software_installed', // A kapcsolótábla neve
  joinColumn: { name: 'hardware_id', referencedColumnName: 'hardware_id' },
  inverseJoinColumn: { name: 'software_id', referencedColumnName: 'software_id' },
})
installed_software: Software[];


@ManyToOne(() => Location, location => location.hardware, { eager: true, nullable: true })
  location: Location;
}