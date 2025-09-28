// mrmnew/backend/src/tickets/ticket.entity.ts

import { User } from '../users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne, // <-- EZ AZ IMPORT HIÁNYZOTT
} from 'typeorm';
import { TicketComment } from './ticket-comment.entity';
import { AccessRequest } from 'src/access-requests/access-request.entity';

export enum TicketStatus {
  UJ = 'Új', // Korábbi 'Nyitott'
  FOLYAMATBAN = 'Folyamatban',
  LEZART = 'Lezárt',
}

export enum TicketPriority {
  ALACSONY = 'Alacsony',
  NORMAL = 'Normál',
  MAGAS = 'Magas',
  KRITIKUS = 'Kritikus',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  ticket_id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.UJ }) // Alapértelmezett módosítva
  status: TicketStatus;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.NORMAL })
  priority: TicketPriority;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator: User | null;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @OneToMany(() => TicketComment, (comment) => comment.ticket)
  comments: TicketComment[];

  @OneToOne(() => AccessRequest, { nullable: true, eager: true })
  @JoinColumn({ name: 'access_request_id' })
  accessRequest: AccessRequest;

    // --- ÚJ MEZŐ ---
  // Ebben a JSON mezőben tároljuk a PDF-alapú kérelem adatait
  @Column({ type: 'json', nullable: true })
  metadata: any;
}