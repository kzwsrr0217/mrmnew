// mrmnew/backend/src/logistics/entities/logistics-item.entity.ts

import { Hardware } from 'src/hardware/hardware.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum LogisticsItemType {
  ESZKOZ = 'Eszköz', // Egyedi azonosítós
  KESZLET = 'Készlet',   // Mennyiségi
}

export enum LogisticsItemStatus {
  RAKTARON = 'Raktáron',
  KIADVA = 'Kiadva',
}

@Entity('logistics_items')
export class LogisticsItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: LogisticsItemType })
  type: LogisticsItemType;

  @Column({ length: 100, nullable: true })
  logistics_id: string; // HETK kód

  @Column({ length: 100, nullable: true })
  material_code: string; // Anyagnem / Anyag

  @Column()
  name: string; // Megnevezés / Anyag rövid szövege

  @Column({ length: 255, nullable: true, unique: true })
  serial_number: string; // Gyártási szám (csak eszközöknél)

  @Column({ type: 'int' })
  quantity: number; // Mennyiség (készletnél > 1)

  @Column()
  location: string; // Telephely / Leltárhely

  @Column({ type: 'enum', enum: LogisticsItemStatus, default: LogisticsItemStatus.RAKTARON })
  status: LogisticsItemStatus;

  @OneToOne(() => Hardware, { nullable: true })
  @JoinColumn({ name: 'assigned_hardware_id' })
  assigned_hardware: Hardware;
}