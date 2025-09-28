// mrmnew/backend/src/tickets/tickets.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TicketStatus } from './ticket.entity';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User, UserRole } from '../users/user.entity';
import { TicketComment } from './ticket-comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name); // <-- EZ HIÁNYZOTT

  constructor(
    @InjectRepository(Ticket) private ticketsRepository: Repository<Ticket>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(TicketComment) private commentsRepository: Repository<TicketComment>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateTicketDto, creatorPayload: { userId: number }): Promise<Ticket> {
    const creator = await this.usersRepository.findOneBy({ id: creatorPayload.userId });
    if (!creator) {
      throw new NotFoundException('A ticketet létrehozó felhasználó nem található.');
    }

    const newTicket = this.ticketsRepository.create({
      ...dto,
      creator: creator,
    });

    if (dto.assignee_id) {
      const assignee = await this.usersRepository.findOneBy({ id: dto.assignee_id });
      if (!assignee) {
        throw new NotFoundException(`A(z) ${dto.assignee_id} azonosítójú felhasználó nem található.`);
      }
      newTicket.assignee = assignee;
    }

    return this.ticketsRepository.save(newTicket);
  }

  findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Visszaadja a tickeket a felhasználó jogosultsága alapján.
   * Admin minden ticketet lát, a többi felhasználó csak a sajátját
   * és a hozzá rendelteket.
   */
  async findAllForUser(user: User): Promise<Ticket[]> {
    const query = this.ticketsRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.creator', 'creator')
      .leftJoinAndSelect('ticket.assignee', 'assignee')
      .orderBy('ticket.created_at', 'DESC');

    // Ha a felhasználó NEM admin, akkor szűrünk a létrehozóra vagy a felelősre
    if (user.role !== UserRole.ADMIN) {
      query.where('creator.id = :userId OR assignee.id = :userId', { userId: user.id });
    }
    // Ha admin, a feltétel kimarad, így minden ticketet visszaad.

    return query.getMany();
  }

  async findOne(id: number, requestingUser?: User): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { ticket_id: id },
      relations: ['comments', 'comments.author', 'assignee', 'creator'],
    });

    if (!ticket) {
      throw new NotFoundException(`A(z) ${id} azonosítójú ticket nem található.`);
    }

    // A logika csak akkor fut le, ha a requestingUser meg van adva
    if (requestingUser && ticket.status === TicketStatus.UJ && ticket.assignee && ticket.assignee.id === requestingUser.id) {
        ticket.status = TicketStatus.FOLYAMATBAN;
        await this.ticketsRepository.save(ticket);
        this.logger.log(`Ticket #${id} státusza 'Folyamatban'-ra változott.`);
    }

    return ticket;
  }

  async addComment(ticketId: number, dto: CreateCommentDto, authorPayload: { userId: number }): Promise<TicketComment> {
    const ticket = await this.findOne(ticketId); // JAVÍTVA: A hívás már helyes, mert a 2. paraméter opcionális
    
    const author = await this.usersRepository.findOneBy({ id: authorPayload.userId });
    if (!author) {
      throw new NotFoundException('A kommentelő felhasználó nem található.');
    }
    
    const newComment = this.commentsRepository.create({
      text: dto.text,
      ticket: ticket,
      author: author,
    });

    return this.commentsRepository.save(newComment);
  }

  async updateStatus(ticketId: number, newStatus: TicketStatus): Promise<Ticket> {
    const ticket = await this.findOne(ticketId); // JAVÍTVA: A hívás már helyes, mert a 2. paraméter opcionális
    ticket.status = newStatus;
    const savedTicket = await this.ticketsRepository.save(ticket);

    if (newStatus === TicketStatus.LEZART) {
      this.eventEmitter.emit('ticket.closed', savedTicket);
    }

    return savedTicket;
  }
}