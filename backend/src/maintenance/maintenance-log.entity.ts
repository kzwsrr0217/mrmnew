// mrmnew/backend/src/maintenance/maintenance-log.entity.ts

import { System } from '../systems/system.entity';
import { User } from '../users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('maintenance_logs')
export class MaintenanceLog {
  @PrimaryGeneratedColumn()
  log_id: number;

  // Melyik rendszeren történt a karbantartás?
  @ManyToOne(() => System, { eager: true })
  @JoinColumn({ name: 'system_id' })
  system: System;

  // Ki végezte a karbantartást?
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  timestamp: Date;
}