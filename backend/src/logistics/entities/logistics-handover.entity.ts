// mrmnew/backend/src/logistics/entities/logistics-handover.entity.ts

import { System } from 'src/systems/system.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('logistics_handovers')
export class LogisticsHandover {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  protocol_number: string;

  @Column({ type: 'date' })
  handover_date: Date;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => System)
  @JoinColumn({ name: 'system_id' })
  system: System;

  @CreateDateColumn()
  created_at: Date;
}