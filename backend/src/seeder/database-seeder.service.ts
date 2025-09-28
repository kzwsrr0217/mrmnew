// mrmnew/backend/src/seeder/database-seeder.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/user.entity';
import { TestDataSeeder } from './test-data.seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TicketPriority, TicketStatus } from 'src/tickets/ticket.entity';
import { Not, Repository } from 'typeorm';
import { AccessRequest, RequestStatus } from 'src/access-requests/access-request.entity';
import { LogisticsSeeder } from 'src/logistics/logistics.seeder'; // <-- ÚJ IMPORT

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly testDataSeeder: TestDataSeeder,
    private readonly logisticsSeeder: LogisticsSeeder, // <-- INJEKTÁLÁS
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(AccessRequest) private accessRequestRepo: Repository<AccessRequest>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
    await this.testDataSeeder.seed();
    await this.seedNotifications(); // <-- ÚJ HÍVÁS
    await this.logisticsSeeder.seed(); // <-- ÚJ HÍVÁS
  }
  private async seedUser(username: string, role: UserRole) {
    const user = await this.usersService.findOne(username);
    if (!user) {
      await this.usersService.create(username, 'password', role);
      this.logger.log(`Felhasználó létrehozva: ${username} (${role}), jelszó: password`);
    }
  }

async seedUsers() {
    this.logger.log('Alapértelmezett felhasználók ellenőrzése...');
    await this.seedUser('admin', UserRole.ADMIN);
    await this.seedUser('bv', UserRole.BV);
    await this.seedUser('hbv', UserRole.HBV);    // <-- ÚJ
    await this.seedUser('hhbv', UserRole.HHBV);  // <-- ÚJ
    await this.seedUser('rbf', UserRole.RBF);
    await this.seedUser('ra', UserRole.RA);
    await this.seedUser('szbf', UserRole.SZBF);
    await this.seedUser('user', UserRole.USER);
    await this.seedUser('apk', UserRole.ALEGYSEGPARANCSNOK); // <-- ÚJ SOR
    this.logger.log('Felhasználók ellenőrzése befejezve.');
}
  /**
   * ÚJ METÓDUS: Létrehoz egy-egy teendőt a BV és RA felhasználóknak.
   */
  async seedNotifications() {
    this.logger.log('Értesítésekhez szükséges tesztadatok ellenőrzése...');

    const bvUser = await this.usersService.findOne('bv');
    const raUser = await this.usersService.findOne('ra');

    if (!bvUser || !raUser) {
        this.logger.warn('A "bv" vagy "ra" felhasználó nem található, az értesítések seeder kihagyva.');
        return;
    }

    // 1. Hozzunk létre egy jóváhagyásra váró kérelmet a BV számára
    const pendingRequestCount = await this.accessRequestRepo.count({ where: { status: RequestStatus.BV_JOVAHAGYASRA_VAR } });
    if (pendingRequestCount === 0) {
        const rbfUser = await this.usersService.findOne('rbf');
        // Feltételezzük, hogy létezik legalább egy személy és rendszer a test-data seederből
        const newRequest = this.accessRequestRepo.create({
            // A Personel és System entitásokat itt most nem töltjük ki teljesen,
            // mert csak a darabszám a lényeg a notifikációhoz.
            // Egy valós seederben ezeket is le kellene kérdezni.
            requester: rbfUser,
            status: RequestStatus.BV_JOVAHAGYASRA_VAR
        });
        await this.accessRequestRepo.save(newRequest);
        this.logger.log('Jóváhagyásra váró kérelem létrehozva a "bv" felhasználó számára.');
    }

    // 2. Hozzunk létre egy nyitott ticketet az RA számára
    const openTicketCount = await this.ticketRepo.count({ where: { assignee: { id: raUser.id }, status: Not(TicketStatus.LEZART) } });
    if (openTicketCount === 0) {
        const newTicket = this.ticketRepo.create({
            title: 'Teszt Ticket az RA-nak',
            description: 'Ez egy automatikusan generált ticket az értesítési rendszer teszteléséhez.',
            priority: TicketPriority.NORMAL,
            assignee: raUser,
        });
        await this.ticketRepo.save(newTicket);
        this.logger.log('Nyitott ticket létrehozva az "ra" felhasználó számára.');
    }
    this.logger.log('Értesítések seeder befejezve.');
  }
}