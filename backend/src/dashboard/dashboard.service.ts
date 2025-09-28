// mrmnew/backend/src/dashboard/dashboard.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { System } from 'src/systems/system.entity';
import { Ticket, TicketStatus } from 'src/tickets/ticket.entity';
import { User } from 'src/users/user.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(System) private systemRepo: Repository<System>,
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
  ) {}

  async getStats() {
    const userCount = await this.userRepo.count();
    const systemCount = await this.systemRepo.count();
    const totalTickets = await this.ticketRepo.count();
    const openTickets = await this.ticketRepo.count({
      where: { status: Not(TicketStatus.LEZART) },
    });

    return {
      userCount,
      systemCount,
      totalTickets,
      openTickets,
    };
  }
}