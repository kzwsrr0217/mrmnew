import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TicketStatus } from './ticket.entity';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { User } from '../users/user.entity';
import { TicketComment } from './ticket-comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectRepository(Ticket) private ticketsRepository: Repository<Ticket>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(TicketComment) private commentsRepository: Repository<TicketComment>,
    private eventEmitter: EventEmitter2,
  ) {}

async create(dto: CreateTicketDto, creatorPayload: { userId: number }): Promise<Ticket> {
    // 1. Naplózzuk, hogy a kérés egyáltalán beérkezett-e és milyen adatokkal
    this.logger.log(`Új ticket létrehozásának kísérlete a következő adatokkal: ${JSON.stringify(dto)}`);
    
    try {
        const creator = await this.usersRepository.findOneBy({ id: creatorPayload.userId });
        if (!creator) {
            // 2. Naplózzuk, ha a LÉTREHOZÓT nem találjuk
            this.logger.error(`HIBA: A ticketet létrehozó felhasználó (ID: ${creatorPayload.userId}) nem található az adatbázisban.`);
            throw new NotFoundException('A ticketet létrehozó felhasználó nem található.');
        }

        const newTicket = this.ticketsRepository.create({
            ...dto,
            creator: creator,
        });

        // Csak akkor lépünk be ide, ha a frontend küldött 'assignee_id'-t
        if (dto.assignee_id) {
            this.logger.log(`Felelős keresése a következő ID alapján: ${dto.assignee_id}...`);
            const assignee = await this.usersRepository.findOneBy({ id: dto.assignee_id });
            
            if (!assignee) {
                // 3. Naplózzuk, ha a FELELŐST nem találjuk
                this.logger.error(`HIBA: A hozzárendelni kívánt felelős (ID: ${dto.assignee_id}) nem található az adatbázisban.`);
                throw new NotFoundException(`A(z) ${dto.assignee_id} azonosítójú felelős felhasználó nem található.`);
            }
            
            this.logger.log(`Felelős (${assignee.username}) sikeresen megtalálva és hozzárendelve.`);
            newTicket.assignee = assignee;
        }

        const savedTicket = await this.ticketsRepository.save(newTicket);
        this.logger.log(`OK: Ticket #${savedTicket.ticket_id} sikeresen létrehozva és elmentve.`);
        return savedTicket;

    } catch (error) {
        // 4. Bármilyen egyéb, váratlan hiba esetén itt fogjuk elkapni és naplózni
        this.logger.error(`VÁRATLAN HIBA a ticket mentése ('save' művelet) során:`, error.stack);
        // Dobjuk tovább az eredeti hibát, hogy a frontend is megkapja
        throw error;
    }
}

  findAll(): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      order: { created_at: 'DESC' },
      relations: ['assignee', 'creator'], // A felelős adatait is lekérjük a listához
    });
  }

  async findOne(id: number, requestingUser?: User): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({
      where: { ticket_id: id },
      relations: ['comments', 'comments.author', 'assignee', 'creator', 'accessRequest'], // accessRequest betöltése
    });

    if (!ticket) {
      throw new NotFoundException(`A(z) ${id} azonosítójú ticket nem található.`);
    }

    if (requestingUser && ticket.status === TicketStatus.UJ && ticket.assignee && ticket.assignee.id === requestingUser.id) {
        ticket.status = TicketStatus.FOLYAMATBAN;
        await this.ticketsRepository.save(ticket);
        this.logger.log(`Ticket #${id} státusza 'Folyamatban'-ra változott.`);
    }

    return ticket;
  }

  async addComment(ticketId: number, dto: CreateCommentDto, authorPayload: { userId: number }): Promise<TicketComment> {
    const ticket = await this.findOne(ticketId);
    
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

    async updateStatus(id: number, status: TicketStatus, user: User): Promise<Ticket> {
        const ticket = await this.ticketsRepository.findOne({ where: { ticket_id: id }, relations: ['assignee', 'accessRequest'] });
        if (!ticket) {
            throw new NotFoundException('A ticket nem található');
        }

        // Ha a ticketnek nincs felelőse (kiosztatlan), és valaki módosítja a státuszát,
        // automatikusan ő lesz a felelős.
        if (!ticket.assignee) {
            ticket.assignee = user;
        }

        ticket.status = status;
        const savedTicket = await this.ticketsRepository.save(ticket);
        
        // Esemény kibocsátása, ha a ticketet lezárták
        if (status === TicketStatus.LEZART) {
            this.eventEmitter.emit('ticket.closed', savedTicket);
        }
        
        return savedTicket;
    }

    async claim(id: number, user: User): Promise<Ticket> {
        const ticket = await this.ticketsRepository.findOne({ where: { ticket_id: id }, relations: ['assignee'] });
        if (!ticket) {
            throw new NotFoundException('A ticket nem található');
        }
        if (ticket.assignee) {
            throw new ForbiddenException('Ezt a ticketet már valaki más felvette.');
        }

        ticket.assignee = user;
        return this.ticketsRepository.save(ticket);
    }
}

