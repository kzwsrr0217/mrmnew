// mrmnew-show/backend/src/system-access/system-access.service.ts

import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemAccess } from './system-access.entity';
import { Repository } from 'typeorm';
import { CreateSystemAccessDto } from './dto/create-system-access.dto';
import { Personel } from '../personel/personel.entity'; // JAVÍTVA
import { System } from '../systems/system.entity';

@Injectable()
export class SystemAccessService {
  constructor(
    @InjectRepository(SystemAccess) private accessRepo: Repository<SystemAccess>,
    @InjectRepository(Personel) private personelRepo: Repository<Personel>, // JAVÍTVA
    @InjectRepository(System) private systemRepo: Repository<System>,
  ) {}

  async grantAccess(dto: CreateSystemAccessDto): Promise<SystemAccess> {
    const personel = await this.personelRepo.findOne({ // JAVÍTVA
      where: { personel_id: dto.personelId }, // JAVÍTVA
    });
    if (!personel) throw new NotFoundException('Személy nem található.');

    const system = await this.systemRepo.findOne({
      where: { systemid: dto.systemId },
      relations: ['permit'],
    });
    if (!system) throw new NotFoundException('Rendszer nem található.');
    if (!system.permit) throw new ForbiddenException('A rendszerhez nincs érvényes engedély, így nem adható hozzáférés.');

    const existingAccess = await this.accessRepo.findOneBy({ 
        personel: { personel_id: dto.personelId }, // JAVÍTVA
        system: { systemid: dto.systemId } 
    });
    if(existingAccess) throw new ConflictException('A személynek már van hozzáférése ehhez a rendszerhez.');

    const userPsd = personel.personal_security_data;
    const systemPermit = system.permit;

    if (systemPermit.nemzeti_classification && (!userPsd.nemzeti_szint || userPsd.nemzeti_szint.rank < systemPermit.nemzeti_classification.rank)) {
      throw new ForbiddenException('A személy nemzeti minősítési szintje nem megfelelő.');
    }
    if (systemPermit.nato_classification && (!userPsd.nato_szint || userPsd.nato_szint.rank < systemPermit.nato_classification.rank)) {
      throw new ForbiddenException('A személy NATO minősítési szintje nem megfelelő.');
    }
    if (systemPermit.eu_classification && (!userPsd.eu_szint || userPsd.eu_szint.rank < systemPermit.eu_classification.rank)) {
      throw new ForbiddenException('A személy EU minősítési szintje nem megfelelő.');
    }
    
    const newAccess = this.accessRepo.create({
      personel: personel, // JAVÍTVA
      system: system,
      access_level: dto.accessLevel,
    });

    return this.accessRepo.save(newAccess);
  }
  findAll(): Promise<SystemAccess[]> {
    return this.accessRepo.find({
      relations: ['personel', 'system'], // Töltsük be a kapcsolódó adatokat is
    });
  }

  async revokeAccess(id: number): Promise<void> {
    const result = await this.accessRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`A(z) ${id} azonosítójú hozzáférés nem található.`);
    }
  }
}