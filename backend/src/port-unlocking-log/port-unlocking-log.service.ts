// mrmnew/backend/src/port-unlocking-log/port-unlocking-log.service.ts

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortUnlockLog, LogStatus } from './port-unlock-log.entity';
import { CreatePortUnlockLogDto } from './dto/create-port-unlock-log.dto';
import { User, UserRole } from '../users/user.entity'; // UserRole importálása
import { System } from '../systems/system.entity';

@Injectable()
export class PortUnlockingLogService {
  constructor(
    @InjectRepository(PortUnlockLog)
    private readonly logRepository: Repository<PortUnlockLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(System)
    private readonly systemRepository: Repository<System>,
  ) {}

  async create(dto: CreatePortUnlockLogDto, requestedBy: User): Promise<PortUnlockLog> {
    // JAVÍTVA: A keresés a 'systemid' mező alapján történik
    const system = await this.systemRepository.findOneBy({ systemid: dto.systemId });
    if (!system) {
      throw new NotFoundException(`System with ID ${dto.systemId} not found`);
    }

    const performedBy = await this.userRepository.findOneBy({ id: dto.performedById });
    if (!performedBy) {
        throw new NotFoundException(`User with ID ${dto.performedById} not found`);
    }

    const newLog = this.logRepository.create({
      ...dto,
      system,
      requestedBy,
      performedBy,
      unlockTime: new Date(dto.unlockTime),
      status: LogStatus.PENDING,
    });

    return this.logRepository.save(newLog);
  }

  findAll(): Promise<PortUnlockLog[]> {
    return this.logRepository.find({ order: { createdAt: 'DESC' } });
  }

  async approve(id: string, approver: User): Promise<PortUnlockLog> {
    const log = await this.logRepository.findOneBy({ id });
    if (!log) {
      throw new NotFoundException(`Log entry with ID ${id} not found`);
    }

    log.approvedBy = approver;
    log.status = LogStatus.APPROVED;
    return this.logRepository.save(log);
  }

  async close(id: string, user: User): Promise<PortUnlockLog> {
    const log = await this.logRepository.findOneBy({ id });
    if (!log) {
      throw new NotFoundException(`Log entry with ID ${id} not found`);
    }
    
    // JAVÍTVA: A szerepkör ellenőrzése a UserRole enum alapján történik
    if (log.performedBy.id !== user.id && user.role !== UserRole.ADMIN) {
        throw new UnauthorizedException('Only the performer or an admin can close this log.');
    }

    log.lockTime = new Date();
    log.status = LogStatus.CLOSED;
    return this.logRepository.save(log);
  }
}