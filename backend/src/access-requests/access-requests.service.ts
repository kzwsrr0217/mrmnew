import { Injectable, NotFoundException, ForbiddenException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Personel } from 'src/personel/personel.entity';
import { System } from 'src/systems/system.entity';
import { SystemAccess } from 'src/system-access/system-access.entity';
import { Repository } from 'typeorm';
import { AccessRequest, RequestStatus } from './access-request.entity';
import { User, UserRole } from 'src/users/user.entity';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';
import { RejectAccessRequestDto } from './dto/reject-access-request.dto';
import { Ticket, TicketPriority } from 'src/tickets/ticket.entity';

@Injectable()
export class AccessRequestsService {
    private readonly logger = new Logger(AccessRequestsService.name);

    constructor(
        @InjectRepository(AccessRequest) private requestRepo: Repository<AccessRequest>,
        @InjectRepository(Personel) private personelRepo: Repository<Personel>,
        @InjectRepository(System) private systemRepo: Repository<System>,
        @InjectRepository(SystemAccess) private accessRepo: Repository<SystemAccess>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Ticket) private ticketRepo: Repository<Ticket>,
    ) {}

    // ... create metódus változatlan ...
    async create(dto: CreateAccessRequestDto, requester: User): Promise<AccessRequest> {
        const personel = await this.personelRepo.findOneBy({ personel_id: dto.personelId });
        if (!personel) throw new NotFoundException('Személy nem található.');
        const system = await this.systemRepo.findOneBy({ systemid: dto.systemId });
        if (!system) throw new NotFoundException('Rendszer nem található.');
        const existingAccess = await this.accessRepo.findOneBy({ personel: { personel_id: dto.personelId }, system: { systemid: dto.systemId } });
        if (existingAccess) throw new ConflictException('A személynek már van hozzáférése ehhez a rendszerhez.');
        const requesterUser = await this.userRepo.findOneBy({ id: requester.id });
        if (!requesterUser) throw new NotFoundException('Kérelmező felhasználó nem található.');

        const newRequest = this.requestRepo.create({
            personel,
            system,
            access_level: dto.accessLevel,
            requester: requesterUser,
            status: RequestStatus.BV_JOVAHAGYASRA_VAR,
        });
        return this.requestRepo.save(newRequest);
    }

    // JAVÍTVA: Kiegészítve az ADMIN szerepkörrel
    findPendingForUser(user: User): Promise<AccessRequest[]> {
        if ([UserRole.ADMIN, UserRole.BV, UserRole.HBV, UserRole.HHBV].includes(user.role)) {
            return this.requestRepo.find({ 
                where: { status: RequestStatus.BV_JOVAHAGYASRA_VAR },
                // Mindig töltsük be a relációkat a frontend számára
                relations: ['personel', 'system', 'requester'] 
            });
        }
        return Promise.resolve([]);
    }
    
    // ... többi metódus változatlan ...
    async approveByBv(requestId: number, approver: User): Promise<Ticket> {
        const request = await this.getRequestById(requestId);
        if (request.status !== RequestStatus.BV_JOVAHAGYASRA_VAR) {
            throw new ForbiddenException('Ez a kérelem nem hagyható jóvá ebben az állapotban.');
        }
        
        request.status = RequestStatus.ENGEDELYEZVE;
        request.bv_approver = approver;
        await this.requestRepo.save(request);

        const raUser = await this.userRepo.findOne({ where: { role: UserRole.RA } });
        if (!raUser) {
            this.logger.warn('Nincs RA szerepkörű felhasználó, akinek a ticketet ki lehetne osztani.');
            throw new NotFoundException('Rendszeradminisztrátor nem található a feladat kiosztásához.');
        }

        const ticketTitle = `[HOZZÁFÉRÉS] ${request.personel.nev} - ${request.system.systemname}`;
        const newTicket = this.ticketRepo.create({
            title: ticketTitle,
            description: `Új hozzáférés beállítása szükséges.\nSzemély: ${request.personel.nev}\nRendszer: ${request.system.systemname}\nJogosultság: ${request.access_level}`,
            priority: TicketPriority.MAGAS,
            assignee: raUser,
            accessRequest: request,
        });

        return this.ticketRepo.save(newTicket);
    }

    async reject(requestId: number, approver: User, dto: RejectAccessRequestDto): Promise<AccessRequest> {
        const request = await this.getRequestById(requestId);
        if (request.status !== RequestStatus.BV_JOVAHAGYASRA_VAR) {
            throw new ForbiddenException('Ez a kérelem már nem utasítható el.');
        }
        request.status = RequestStatus.ELUTASITVA;
        request.rejection_reason = dto.reason;
        request.bv_approver = approver;
        return this.requestRepo.save(request);
    }

    private async getRequestById(id: number): Promise<AccessRequest> {
        const request = await this.requestRepo.findOne({
            where: { id: id },
            relations: ['personel', 'system']
        });
        if (!request) {
            throw new NotFoundException(`A(z) ${id} azonosítójú kérelem nem található.`);
        }
        return request;
    }
}