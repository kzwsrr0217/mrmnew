import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { TicketsService } from './tickets.service';
import { Ticket } from './ticket.entity';
import { User } from '../users/user.entity';
import { TicketComment } from './ticket-comment.entity';

// Mock TypeORM repository
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

describe('TicketsService', () => {
  let service: TicketsService;
  let ticketRepository: MockRepository<Ticket>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(), // Mockoljuk a User repository-t is
        },
        {
          provide: getRepositoryToken(TicketComment),
          useValue: createMockRepository(), // Mockoljuk a Comment repository-t is
        },
        {
          provide: EventEmitter2, // Mockoljuk az EventEmitter-t
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    ticketRepository = module.get<MockRepository<Ticket>>(
      getRepositoryToken(Ticket),
    );
  });

  it('service-nek definiálva kell lennie', () => {
    expect(service).toBeDefined();
  });

  describe('claim', () => {
    it('Hozzá kell rendelnie egy userhez a kiosztatlan ticketet', async () => {
      const mockTicket = { ticket_id: 1, assignee: null };
      const mockUser = { id: 1, username: 'testuser' };

      ticketRepository.findOne.mockResolvedValue(mockTicket);
      ticketRepository.save.mockImplementation(ticket => Promise.resolve(ticket));

      const result = await service.claim(1, mockUser as User);

      expect(result.assignee).toEqual(mockUser);
      expect(ticketRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          assignee: mockUser,
        }),
      );
    });

    it('ForbiddenException kell kapni ha a ticketnek már van assignee-ja', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      const assignedTicket = { ticket_id: 2, assignee: mockUser }; 

      ticketRepository.findOne.mockResolvedValue(assignedTicket);

      await expect(service.claim(2, mockUser as User)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('NotFoundException ha a ticket nem létezik', async () => {
        const mockUser = { id: 99, username: 'testuser' };
        ticketRepository.findOne.mockResolvedValue(null); 

        await expect(service.claim(99, mockUser as User)).rejects.toThrow(
            NotFoundException,
        );
    });
  });
});