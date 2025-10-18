// mrmnew/backend/src/notifications/notifications.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessRequest, RequestStatus } from 'src/access-requests/access-request.entity';
import { Ticket, TicketStatus } from 'src/tickets/ticket.entity';
import { User, UserRole } from 'src/users/user.entity';
import { In, Not, Repository, Between, Brackets } from 'typeorm'; // JAVÍTVA: Between és Brackets import
import { SystemPermit } from 'src/system-permits/system-permit.entity';
import { Personel } from 'src/personel/personel.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(AccessRequest) private requestRepo: Repository<AccessRequest>,
    @InjectRepository(SystemPermit) private permitRepo: Repository<SystemPermit>,
    @InjectRepository(Personel) private personelRepo: Repository<Personel>,
  ) {}

  async getNotificationsForUser(user: User) {
    const today = new Date();
    
    // --- Alap értesítések (Ticketek, Jóváhagyások) ---

    // 1. Ticketek
    let openTickets: Ticket[] = [];
    let allOpenTickets: Ticket[] = []; // Csak adminnak

    if (user.role === UserRole.ADMIN) {
      allOpenTickets = await this.ticketRepo.find({
        where: { status: Not(TicketStatus.LEZART) },
        relations: ['assignee'], // Hogy lássuk, kihez tartozik
      });
    } else {
      openTickets = await this.ticketRepo.find({
        where: {
          assignee: { id: user.id },
          status: Not(TicketStatus.LEZART),
        },
      });
    }

    // 2. Jóváhagyásra váró kérelmek
    let pendingApprovals: AccessRequest[] = [];
    const isApprover = [UserRole.BV, UserRole.HBV, UserRole.HHBV, UserRole.ADMIN].includes(user.role);
    if (isApprover) {
      pendingApprovals = await this.requestRepo.find({
        where: { status: RequestStatus.BV_JOVAHAGYASRA_VAR },
      });
    }

    // --- ÚJ, SZEREPKÖR ALAPÚ ÉRTESÍTÉSEK ---

    // 3. Lejáró rendszerengedélyek (RBF és Admin látja)
    let expiringPermits: SystemPermit[] = [];
    if ([UserRole.RBF, UserRole.ADMIN].includes(user.role)) {
      const threeMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
      
      expiringPermits = await this.permitRepo.find({
        where: {
          ervenyesseg_datuma: Between(today, threeMonthsFromNow),
        },
        relations: ['system'], // Hogy a rendszer nevét is lássuk
      });
    }

    // 4. Lejáró személyi biztonsági tanúsítványok (RBF, SZBF, Admin látja)
    let expiringCertificates: Personel[] = [];
    if ([UserRole.RBF, UserRole.SZBF, UserRole.ADMIN].includes(user.role)) {
      const sixMonthsFromNow = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
      
      // JAVÍTVA: QueryBuilder használata a komplex OR feltételhez (bármelyik tanúsítvány lejár)
      expiringCertificates = await this.personelRepo.createQueryBuilder("personel")
        .leftJoinAndSelect("personel.personal_security_data", "psd") // Betöltjük a kapcsolódó adatokat
        .where("personel.personal_security_data IS NOT NULL")
        .andWhere(new Brackets(qb => { // Zárójeles (OR) csoport
            qb.where("psd.szbt_lejarat BETWEEN :today AND :sixMonths")
              .orWhere("psd.nato_lejarat BETWEEN :today AND :sixMonths")
              .orWhere("psd.eu_lejarat BETWEEN :today AND :sixMonths")
        }))
        .setParameters({ today: today.toISOString(), sixMonths: sixMonthsFromNow.toISOString() })
        .getMany();
    }

    // JAVÍTVA: Visszatérési objektum bővítése
    return {
      openTickets, // Felhasználó sajátja
      allOpenTickets, // Adminnak az összes
      pendingApprovals,
      expiringPermits,
      expiringCertificates,
    };
  }
}