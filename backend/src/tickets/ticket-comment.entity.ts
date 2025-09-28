import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { User } from '../users/user.entity';

@Entity('ticket_comments')
export class TicketComment {
  @PrimaryGeneratedColumn()
  comment_id: number;

  @Column({ type: 'text' })
  text: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => Ticket, (ticket) => ticket.comments)
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;
}