// mrmnew/backend/src/tickets/ticket-automation.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemPermit } from '../system-permits/system-permit.entity';
import { Between, Repository } from 'typeorm';
import { Ticket, TicketPriority, TicketStatus } from './ticket.entity';
import { User, UserRole } from '../users/user.entity';
import { PersonalSecurityData } from '../personal-security-data/personal-security-data.entity';
import { SystemAccess } from '../system-access/system-access.entity';

@Injectable()
export class TicketAutomationService {
  private readonly logger = new Logger(TicketAutomationService.name);

  constructor(
    @InjectRepository(SystemPermit)
    private permitRepository: Repository<SystemPermit>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PersonalSecurityData)
    private psdRepository: Repository<PersonalSecurityData>,
    @InjectRepository(SystemAccess)
    private accessRepository: Repository<SystemAccess>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleExpiringPermits() {
    this.logger.log('Lejáró engedélyek ellenőrzése...');

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringPermits = await this.permitRepository.find({
      where: {
        ervenyesseg_datuma: Between(new Date(), thirtyDaysFromNow),
      },
      relations: ['system'],
    });

    if (expiringPermits.length === 0) {
      this.logger.log('Nincs lejáró engedély a következő 30 napban.');
      return;
    }
    
    const assignee = await this.userRepository.findOne({ where: { role: UserRole.RBF } });
    if (!assignee) {
      this.logger.warn('Nincs RBF szerepkörű felhasználó, akinek a ticketet ki lehetne osztani.');
      return;
    }

    for (const permit of expiringPermits) {
      const ticketTitle = `[AUTOMATA] Engedély lejár: ${permit.system.systemname}`;
      const existingTicket = await this.ticketRepository.findOne({
        where: {
          title: ticketTitle,
          status: TicketStatus.UJ, // JAVÍTVA
        },
      });

      if (!existingTicket) {
        const newTicket = this.ticketRepository.create({
          title: ticketTitle,
          description: `A(z) "${permit.system.systemname}" rendszer engedélye (${permit.engedely_szam}) le fog járni ekkor: ${new Date(permit.ervenyesseg_datuma).toLocaleDateString()}. Kérlek, indítsd el a megújítási folyamatot.`,
          priority: TicketPriority.MAGAS,
          assignee: assignee,
          creator: null,
        });
        await this.ticketRepository.save(newTicket);
        this.logger.log(`Új ticket létrehozva: ${ticketTitle}`);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleExpiringCertificates() {
    this.logger.log('Hamarosan lejáró tanúsítványok ellenőrzése...');

    const today = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    const expiringPsdList = await this.psdRepository.createQueryBuilder("psd")
      .innerJoinAndSelect("psd.personel", "personel")
      .where("psd.szbt_lejarat BETWEEN :today AND :sixMonthsFromNow", { today, sixMonthsFromNow })
      .orWhere("psd.nato_lejarat BETWEEN :today AND :sixMonthsFromNow", { today, sixMonthsFromNow })
      .orWhere("psd.eu_lejarat BETWEEN :today AND :sixMonthsFromNow", { today, sixMonthsFromNow })
      .getMany();

    if (expiringPsdList.length === 0) return;

    const assignee = await this.userRepository.findOne({ where: { role: UserRole.SZBF } });
    if (!assignee) return;

    for (const psd of expiringPsdList) {
      const ticketTitle = `[AUTOMATA] Tanúsítvány lejár: ${psd.personel.nev}`;
      const existingTicket = await this.ticketRepository.findOne({
        where: { title: ticketTitle, status: TicketStatus.UJ }, // JAVÍTVA
      });

      if (!existingTicket) {
        const newTicket = this.ticketRepository.create({
          title: ticketTitle,
          description: `A(z) "${psd.personel.nev}" nevű személy tanúsítványa hamarosan lejár. Kérlek, értesítsd az illetőt a megújítási folyamat elindításáról.`,
          priority: TicketPriority.NORMAL,
          assignee: assignee,
          creator: null,
        });
        await this.ticketRepository.save(newTicket);
        this.logger.log(`Új ticket létrehozva: ${ticketTitle}`);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleExpiredCertificates() {
    this.logger.log('Lejárt tanúsítványok kezelése...');
    const today = new Date();

    const expiredPsdList = await this.psdRepository.createQueryBuilder("psd")
      .innerJoinAndSelect("psd.personel", "personel")
      .where("psd.szbt_lejarat < :today", { today })
      .orWhere("psd.nato_lejarat < :today", { today })
      .orWhere("psd.eu_lejarat < :today", { today })
      .getMany();

    if (expiredPsdList.length === 0) return;

    const assignee = await this.userRepository.findOne({ where: { role: UserRole.RBF } });
    if (!assignee) return;

    for (const psd of expiredPsdList) {
      const accessesToRevoke = await this.accessRepository.find({ where: { personel: { personel_id: psd.personel.personel_id } } });
      if (accessesToRevoke.length > 0) {
        await this.accessRepository.remove(accessesToRevoke);
        this.logger.log(`[${psd.personel.nev}] ${accessesToRevoke.length} db hozzáférés visszavonva lejárt tanúsítvány miatt.`);
        
        const ticketTitle = `[AUTOMATA] Lejárt tanúsítvány: ${psd.personel.nev}`;
        const existingTicket = await this.ticketRepository.findOne({ where: { title: ticketTitle, status: TicketStatus.UJ } }); // JAVÍTVA

        if (!existingTicket) {
            const newTicket = this.ticketRepository.create({
                title: ticketTitle,
                description: `A(z) "${psd.personel.nev}" nevű személy tanúsítványa lejárt. A rendszerhez való összes hozzáférése automatikusan visszavonásra került.`,
                priority: TicketPriority.KRITIKUS,
                assignee: assignee,
                creator: null,
            });
            await this.ticketRepository.save(newTicket);
            this.logger.log(`Új ticket létrehozva: ${ticketTitle}`);
        }
      }
    }
  }
}