import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MaintenanceLog } from './maintenance-log.entity';
import { Repository } from 'typeorm';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';
import { User } from '../users/user.entity';
import { System } from '../systems/system.entity';
import { TicketsService } from 'src/tickets/tickets.service';
import { TicketPriority } from 'src/tickets/ticket.entity';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceLog)
    private logsRepository: Repository<MaintenanceLog>,
    @InjectRepository(System)
    private systemsRepository: Repository<System>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly ticketsService: TicketsService,
  ) {}

  findAll(): Promise<MaintenanceLog[]> {
    return this.logsRepository.find({
      relations: ['user', 'system'],
      order: { timestamp: 'DESC' },
    });
  }

  async create(dto: CreateMaintenanceLogDto, userPayload: { userId: number }): Promise<MaintenanceLog> {
    const system = await this.systemsRepository.findOneBy({ systemid: dto.system_id });
    if (!system) {
      throw new NotFoundException(`A(z) ${dto.system_id} azonosítójú rendszer nem található.`);
    }

    const user = await this.usersRepository.findOneBy({ id: userPayload.userId });
    if (!user) {
        throw new NotFoundException('A felhasználó nem található.');
    }

    const newLogEntry = this.logsRepository.create({
      description: dto.description,
      system: system,
      user: user,
    });

    const savedLog = await this.logsRepository.save(newLogEntry);

    if (dto.createTicket) {
      // Itt adjuk át az assignee_id-t is a ticket service-nek
      await this.ticketsService.create({
        title: `Karbantartás: ${system.systemname}`,
        description: `A következő karbantartási bejegyzés alapján generálva:\n\n---\n${dto.description}\n---\n\nLog ID: ${savedLog.log_id}`,
        priority: TicketPriority.NORMAL,
        assignee_id: dto.assignee_id, // <-- ITT A VÁLTOZÁS
      }, userPayload);
    }

    return savedLog;
  }
}