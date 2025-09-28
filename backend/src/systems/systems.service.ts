// mrm-backend/src/systems/systems.service.ts

import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { System } from './system.entity';
import { DocumentType } from '../documents/document.entity';


@Injectable()
export class SystemsService {
  constructor(
    @InjectRepository(System)
    private systemsRepository: Repository<System>,
  ) {}

  findAll(): Promise<System[]> {
    // JAVÍTÁS: Kiegészítjük a lekérdezést a 'permit' relációval
    return this.systemsRepository.find({
      relations: ['permit'],
    });
  }

  findOne(id: number): Promise<System | null> {
    return this.systemsRepository.findOneBy({ systemid: id });
  }

  async remove(id: number): Promise<void> {
    await this.systemsRepository.delete(id);
  }

  async create(systemData: Partial<System>): Promise<System> { // <-- Legyen async
    const newSystem = this.systemsRepository.create(systemData);
    try {
      return await this.systemsRepository.save(newSystem); // <-- Használj await-et
    } catch (error) {
      // Ellenőrizzük, hogy a hiba a MySQL 'duplicate entry' hibája-e (hibakód: 'ER_DUP_ENTRY')
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('A megadott rendszerengedélyszám már létezik.');
      }
      // Ha más hiba történt, akkor azt továbbdobjuk, hogy a Nest alap hibakezelője kapja el
      throw error;
    }
}
async checkAndActivateSystem(systemId: number): Promise<void> {
    const system = await this.systemsRepository.findOne({
      where: { systemid: systemId },
      relations: ['documents'],
    });

    if (!system) return;

    const hasPermit = system.documents.some(doc => doc.type === DocumentType.RENDSZERENGEDELY && doc.filepath);
    const hasUbsz = system.documents.some(doc => doc.type === DocumentType.UBSZ && doc.filepath);

    if (hasPermit && hasUbsz) {
      system.status = 'Aktív';
      await this.systemsRepository.save(system);
    }
}
}