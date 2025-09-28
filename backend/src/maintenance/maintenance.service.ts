// mrmnew/backend/src/maintenance/maintenance.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MaintenanceLog } from './maintenance-log.entity';
import { Repository } from 'typeorm';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';
import { User } from '../users/user.entity';
import { System } from '../systems/system.entity';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceLog)
    private logsRepository: Repository<MaintenanceLog>,
    @InjectRepository(System)
    private systemsRepository: Repository<System>,
    @InjectRepository(User) // Inject the User repository
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Visszaadja az összes karbantartási naplóbejegyzést.
   */
  findAll(): Promise<MaintenanceLog[]> {
    return this.logsRepository.find({
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Létrehoz egy új karbantartási naplóbejegyzést.
   */
  async create(dto: CreateMaintenanceLogDto, userPayload: { userId: number }): Promise<MaintenanceLog> {
    const system = await this.systemsRepository.findOneBy({ systemid: dto.system_id });
    if (!system) {
      throw new NotFoundException(`A(z) ${dto.system_id} azonosítójú rendszer nem található.`);
    }

    const user = await this.usersRepository.findOneBy({ id: userPayload.userId });
    if (!user) {
        throw new NotFoundException('A felhasználó nem található.');
    }

    const newLogEntry = this.logsRepository.create({
      description: dto.description,
      system: system,
      user: user, // Use the fetched User entity
    });

    return this.logsRepository.save(newLogEntry);
  }
}