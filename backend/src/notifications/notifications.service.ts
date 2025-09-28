// mrmnew/backend/src/notifications/notifications.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessRequest, RequestStatus } from 'src/access-requests/access-request.entity';
import { Ticket, TicketStatus } from 'src/tickets/ticket.entity';
import { User, UserRole } from 'src/users/user.entity';
import { In, Not, Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(AccessRequest) private requestRepo: Repository<AccessRequest>,
  ) {}

  async getNotificationsForUser(user: User) {
    // 1. Felhasználóhoz rendelt, nem lezárt ticketek lekérdezése
    const openTickets = await this.ticketRepo.find({
      where: {
        assignee: { id: user.id },
        status: Not(TicketStatus.LEZART),
      },
    });

    // 2. Felhasználó szerepköre alapján jóváhagyásra váró kérelmek lekérdezése
    let pendingApprovals: AccessRequest[] = [];
    const isApprover = [UserRole.BV, UserRole.HBV, UserRole.HHBV].includes(user.role);
    if (isApprover) {
      pendingApprovals = await this.requestRepo.find({
        where: { status: RequestStatus.BV_JOVAHAGYASRA_VAR },
      });
    }

    return {
      openTickets,
      pendingApprovals,
    };
  }
}