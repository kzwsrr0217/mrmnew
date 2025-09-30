// mrmnew/backend/src/seeder/database-seeder.service.ts

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/user.entity';
import { TestDataSeeder } from './test-data.seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TicketPriority, TicketStatus } from 'src/tickets/ticket.entity';
import { Not, Repository } from 'typeorm';
import { AccessRequest, RequestStatus } from 'src/access-requests/access-request.entity';
import { LogisticsSeeder } from 'src/logistics/logistics.seeder';
// --- ÚJ IMPORTOK ---
import { LocationSeederService } from './locations.seeder';
import { DataHandlingPermitSeederService } from './data-handling-permits.seeder';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly testDataSeeder: TestDataSeeder,
    private readonly logisticsSeeder: LogisticsSeeder,
    // --- ÚJ INJEKTÁLÁSOK ---
    private readonly locationSeeder: LocationSeederService,
    private readonly permitSeeder: DataHandlingPermitSeederService,
    @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    @InjectRepository(AccessRequest) private accessRequestRepo: Repository<AccessRequest>,
  ) {}

  async onModuleInit() {
    await this.runAllSeeders();
  }

  // Létrehoztunk egy közös futtatót, amit a controller is hívhat
  async runAllSeeders() {
    this.logger.log('--- Kezdődik az adatbázis feltöltése ---');
    await this.seedUsers();
    await this.testDataSeeder.seed();
    await this.logisticsSeeder.seed();
    
    // --- ÚJ HÍVÁSOK ---
    const locations = await this.locationSeeder.seed(); // Visszakérjük a létrehozott helyszíneket
    await this.permitSeeder.seed(locations); // Átadjuk őket az engedély seedernek

    await this.seedNotifications();
    this.logger.log('--- Adatbázis feltöltése befejeződött ---');
  }

  // ... (a seedUsers és seedNotifications metódusok változatlanok)
  
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
    await this.seedUser('hbv', UserRole.HBV);
    await this.seedUser('hhbv', UserRole.HHBV);
    await this.seedUser('rbf', UserRole.RBF);
    await this.seedUser('ra', UserRole.RA);
    await this.seedUser('szbf', UserRole.SZBF);
    await this.seedUser('user', UserRole.USER);
    await this.seedUser('apk', UserRole.ALEGYSEGPARANCSNOK);
    this.logger.log('Felhasználók ellenőrzése befejezve.');
  }
  
  async seedNotifications() {
    this.logger.log('Értesítésekhez szükséges tesztadatok ellenőrzése...');
    const bvUser = await this.usersService.findOne('bv');
    const raUser = await this.usersService.findOne('ra');
    if (!bvUser || !raUser) {
        this.logger.warn('A "bv" vagy "ra" felhasználó nem található, az értesítések seeder kihagyva.');
        return;
    }
    const pendingRequestCount = await this.accessRequestRepo.count({ where: { status: RequestStatus.BV_JOVAHAGYASRA_VAR } });
    if (pendingRequestCount === 0) {
        const rbfUser = await this.usersService.findOne('rbf');
        const newRequest = this.accessRequestRepo.create({
            requester: rbfUser,
            status: RequestStatus.BV_JOVAHAGYASRA_VAR
        });
        await this.accessRequestRepo.save(newRequest);
        this.logger.log('Jóváhagyásra váró kérelem létrehozva a "bv" felhasználó számára.');
    }
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