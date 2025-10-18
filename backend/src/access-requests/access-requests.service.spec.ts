import { Test, TestingModule } from '@nestjs/testing';
import { AccessRequestsService } from './access-requests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccessRequest, RequestStatus } from './access-request.entity';
import { Personel } from 'src/personel/personel.entity';
import { System } from 'src/systems/system.entity';
import { SystemAccess } from 'src/system-access/system-access.entity';
import { User, UserRole } from 'src/users/user.entity';
import { Ticket, TicketPriority } from 'src/tickets/ticket.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';

describe('AccessRequestsService', () => {
  let service: AccessRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessRequestsService],
    }).compile();

    service = module.get<AccessRequestsService>(AccessRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('AccessRequestsService', () => {
    let service: AccessRequestsService;
    let requestRepo: Repository<AccessRequest>;
    let personelRepo: Repository<Personel>;
    let systemRepo: Repository<System>;
    let accessRepo: Repository<SystemAccess>;
    let userRepo: Repository<User>;
    let ticketRepo: Repository<Ticket>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AccessRequestsService,
          { provide: getRepositoryToken(AccessRequest), useValue: { findOneBy: jest.fn(), create: jest.fn(), save: jest.fn(), find: jest.fn() } },
          { provide: getRepositoryToken(Personel), useValue: { findOneBy: jest.fn() } },
          { provide: getRepositoryToken(System), useValue: { findOneBy: jest.fn() } },
          { provide: getRepositoryToken(SystemAccess), useValue: { findOneBy: jest.fn() } },
          { provide: getRepositoryToken(User), useValue: { findOneBy: jest.fn() } },
          { provide: getRepositoryToken(Ticket), useValue: { create: jest.fn(), save: jest.fn() } },
        ],
      }).compile();

      service = module.get<AccessRequestsService>(AccessRequestsService);
      requestRepo = module.get(getRepositoryToken(AccessRequest));
      personelRepo = module.get(getRepositoryToken(Personel));
      systemRepo = module.get(getRepositoryToken(System));
      accessRepo = module.get(getRepositoryToken(SystemAccess));
      userRepo = module.get(getRepositoryToken(User));
      ticketRepo = module.get(getRepositoryToken(Ticket));
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    describe('create', () => {
      it('should throw NotFoundException if personel not found', async () => {
        (personelRepo.findOneBy as jest.Mock).mockResolvedValue(null);
        await expect(
          service.create({ personelId: 1, systemId: 2, accessLevel: 'admin' }, { id: 99 } as User)
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException if system not found', async () => {
        (personelRepo.findOneBy as jest.Mock).mockResolvedValue({ personel_id: 1 });
        (systemRepo.findOneBy as jest.Mock).mockResolvedValue(null);
        await expect(
          service.create({ personelId: 1, systemId: 2, accessLevel: 'admin' }, { id: 99 } as User)
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw ConflictException if access already exists', async () => {
        (personelRepo.findOneBy as jest.Mock).mockResolvedValue({ personel_id: 1 });
        (systemRepo.findOneBy as jest.Mock).mockResolvedValue({ systemid: 2 });
        (accessRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 123 });
        await expect(
          service.create({ personelId: 1, systemId: 2, accessLevel: 'admin' }, { id: 99 } as User)
        ).rejects.toThrow(ConflictException);
      });

      it('should throw NotFoundException if requester user not found', async () => {
        (personelRepo.findOneBy as jest.Mock).mockResolvedValue({ personel_id: 1 });
        (systemRepo.findOneBy as jest.Mock).mockResolvedValue({ systemid: 2 });
        (accessRepo.findOneBy as jest.Mock).mockResolvedValue(null);
        (userRepo.findOneBy as jest.Mock).mockResolvedValue(null);
        await expect(
          service.create({ personelId: 1, systemId: 2, accessLevel: 'admin' }, { id: 99 } as User)
        ).rejects.toThrow(NotFoundException);
      });

      it('should create and save a new access request', async () => {
        const personel = { personel_id: 1 };
        const system = { systemid: 2 };
        const requesterUser = { id: 99 };
        const dto = { personelId: 1, systemId: 2, accessLevel: 'admin' };
        const newRequest = { id: 123, ...dto, personel, system, requester: requesterUser, status: RequestStatus.BV_JOVAHAGYASRA_VAR };

        (personelRepo.findOneBy as jest.Mock).mockResolvedValue(personel);
        (systemRepo.findOneBy as jest.Mock).mockResolvedValue(system);
        (accessRepo.findOneBy as jest.Mock).mockResolvedValue(null);
        (userRepo.findOneBy as jest.Mock).mockResolvedValue(requesterUser);
        (requestRepo.create as jest.Mock).mockReturnValue(newRequest);
        (requestRepo.save as jest.Mock).mockResolvedValue(newRequest);

        const result = await service.create(dto, requesterUser as User);
        expect(requestRepo.create).toHaveBeenCalledWith({
          personel,
          system,
          access_level: dto.accessLevel,
          requester: requesterUser,
          status: RequestStatus.BV_JOVAHAGYASRA_VAR,
        });
        expect(requestRepo.save).toHaveBeenCalledWith(newRequest);
        expect(result).toEqual(newRequest);
      });
    });

    describe('findPendingForUser', () => {
      it('should return pending requests for BV roles', async () => {
        const user = { role: UserRole.BV } as User;
        const pendingRequests = [{ id: 1 }, { id: 2 }];
        (requestRepo.find as jest.Mock).mockResolvedValue(pendingRequests);
        const result = await service.findPendingForUser(user);
        expect(requestRepo.find).toHaveBeenCalledWith({ where: { status: RequestStatus.BV_JOVAHAGYASRA_VAR } });
        expect(result).toEqual(pendingRequests);
      });

      it('should return empty array for non-BV roles', async () => {
        const user = { role: UserRole.USER } as User;
        const result = await service.findPendingForUser(user);
        expect(result).toEqual([]);
      });
    });

    describe('approveByBv', () => {
      it('should throw ForbiddenException if request status is not BV_JOVAHAGYASRA_VAR', async () => {
        const request = { id: 1, status: RequestStatus.ELUTASITVA };
        (requestRepo.findOneBy as jest.Mock).mockResolvedValue(request);
        await expect(service.approveByBv(1, { id: 2 } as User)).rejects.toThrow(ForbiddenException);
      });

      it('should update request status and create a ticket', async () => {
        const request = {
          id: 1,
          status: RequestStatus.BV_JOVAHAGYASRA_VAR,
          personel: { nev: 'Teszt Személy' },
          system: { systemname: 'Teszt Rendszer' },
          access_level: 'admin',
        };
        const approver = { id: 2 } as User;
        const updatedRequest = { ...request, status: RequestStatus.ENGEDELYEZVE, bv_approver: approver };
        const ticket = {
          title: `[HOZZÁFÉRÉS] Teszt Személy - Teszt Rendszer`,
          description: expect.any(String),
          priority: TicketPriority.MAGAS,
          assignee: null,
          accessRequest: updatedRequest,
        };
        (requestRepo.findOneBy as jest.Mock).mockResolvedValue(request);
        (requestRepo.save as jest.Mock).mockResolvedValue(updatedRequest);
        (ticketRepo.create as jest.Mock).mockReturnValue(ticket);
        (ticketRepo.save as jest.Mock).mockResolvedValue(ticket);

        const result = await service.approveByBv(1, approver);
        expect(requestRepo.save).toHaveBeenCalledWith(updatedRequest);
        expect(ticketRepo.create).toHaveBeenCalledWith(ticket);
        expect(ticketRepo.save).toHaveBeenCalledWith(ticket);
        expect(result).toEqual(ticket);
      });
    });

    describe('reject', () => {
      it('should throw ForbiddenException if request status is not BV_JOVAHAGYASRA_VAR', async () => {
        const request = { id: 1, status: RequestStatus.ELUTASITVA };
        (requestRepo.findOneBy as jest.Mock).mockResolvedValue(request);
        await expect(service.reject(1, { id: 2 } as User, { reason: 'Nem megfelelő' })).rejects.toThrow(ForbiddenException);
      });

      it('should update request status and rejection reason', async () => {
        const request = { id: 1, status: RequestStatus.BV_JOVAHAGYASRA_VAR };
        const approver = { id: 2 } as User;
        const dto = { reason: 'Nem megfelelő' };
        const updatedRequest = { ...request, status: RequestStatus.ELUTASITVA, rejection_reason: dto.reason, bv_approver: approver };
        (requestRepo.findOneBy as jest.Mock).mockResolvedValue(request);
        (requestRepo.save as jest.Mock).mockResolvedValue(updatedRequest);

        const result = await service.reject(1, approver, dto);
        expect(requestRepo.save).toHaveBeenCalledWith(updatedRequest);
        expect(result).toEqual(updatedRequest);
      });
    });

    describe('getRequestById', () => {
      it('should throw NotFoundException if request not found', async () => {
        (requestRepo.findOneBy as jest.Mock).mockResolvedValue(null);
        // @ts-ignore
        await expect(service['getRequestById'](999)).rejects.toThrow(NotFoundException);
      });

      it('should return request if found', async () => {
        const request = { id: 1 };
        (requestRepo.findOneBy as jest.Mock).mockResolvedValue(request);
        // @ts-ignore
        const result = await service['getRequestById'](1);
        expect(result).toEqual(request);
      });
    });
  });


});
