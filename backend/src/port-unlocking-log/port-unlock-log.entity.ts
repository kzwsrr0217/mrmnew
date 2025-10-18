import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { System } from '../systems/system.entity';

export enum LogStatus {
  PENDING = 'Függőben',
  APPROVED = 'Engedélyezve',
  CLOSED = 'Lezárva',
}

@Entity()
export class PortUnlockLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => System, { eager: true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  system: System;

  @Column()
  workstation: string; // Munkaállomás azonosítója

  @Column()
  pendriveId: string; // Pendrive nyilvántartási száma

  @Column('text')
  filesToCopy: string; // Másolandó fájlok és célmappa

  @Column()
  unlockTime: Date; // Port feloldásának időpontja

  @Column({ type: 'datetime', nullable: true })
  lockTime: Date | null; // Port lezárásának időpontja

  @ManyToOne(() => User, { eager: true })
  requestedBy: User; // RBF (aki kérte)

  @ManyToOne(() => User, { eager: true })
  performedBy: User; // RA (aki végrehajtotta)

  @ManyToOne(() => User, { nullable: true, eager: true })
  approvedBy: User; // BV/HBV/HHBV (aki engedélyezte)

  @Column({
    type: 'enum',
    enum: LogStatus,
    default: LogStatus.PENDING,
  })
  status: LogStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}