// mrm-backend/src/system-permits/system-permits.service.ts

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemPermit } from './system-permit.entity';
import { CreateSystemPermitDto } from './dto/create-system-permit.dto';
import { System } from '../systems/system.entity';
import { ClassificationLevel } from '../classifications/classification.entity';
import { UpdateSystemPermitDto } from './dto/update-system-permit.dto';

@Injectable()
export class SystemPermitsService {
  constructor(
    @InjectRepository(SystemPermit) private permitRepo: Repository<SystemPermit>,
    @InjectRepository(System) private systemRepo: Repository<System>,
    @InjectRepository(ClassificationLevel) private classificationRepo: Repository<ClassificationLevel>,
  ) {}

  /**
   * Új rendszerengedély létrehozása.
   */
  async create(dto: CreateSystemPermitDto): Promise<SystemPermit> {
    const system = await this.systemRepo.findOne({
      where: { systemid: dto.system_id },
      relations: ['permit'],
    });

    if (!system) {
      throw new NotFoundException(`A(z) ${dto.system_id} azonosítójú rendszer nem található.`);
    }

    if (system.permit) {
      throw new ConflictException(`A(z) ${system.systemname} rendszernek már van engedélye.`);
    }

    const newPermit = this.permitRepo.create({
      engedely_szam: dto.engedely_szam,
      kerelem_szam: dto.kerelem_szam,
      kiallitas_datuma: dto.kiallitas_datuma,
      ervenyesseg_datuma: dto.ervenyesseg_datuma,
      system: system,
    });

    if (dto.nemzeti_classification_id) {
      const classification = await this.classificationRepo.findOneBy({ classification_id: dto.nemzeti_classification_id });
      if (!classification) throw new NotFoundException('Nemzeti minősítés nem található.');
      newPermit.nemzeti_classification = classification;
    }
    
    if (dto.nato_classification_id) {
      const classification = await this.classificationRepo.findOneBy({ classification_id: dto.nato_classification_id });
      if (!classification) throw new NotFoundException('NATO minősítés nem található.');
      newPermit.nato_classification = classification;
    }

    if (dto.eu_classification_id) {
      const classification = await this.classificationRepo.findOneBy({ classification_id: dto.eu_classification_id });
      if (!classification) throw new NotFoundException('EU minősítés nem található.');
      newPermit.eu_classification = classification;
    }

    return this.permitRepo.save(newPermit);
  }

  /**
   * Rendszerengedély lekérdezése rendszerazonosító alapján.
   */
  async findOneBySystemId(systemId: number): Promise<SystemPermit> {
    const permit = await this.permitRepo.findOne({
      where: { system: { systemid: systemId } },
      // Az "eager: true" miatt a minősítések automatikusan betöltődnek az entitásban
    });
    
    if (!permit) {
      throw new NotFoundException(`A(z) ${systemId} azonosítójú rendszerhez nem található engedély.`);
    }

    return permit;
  }

  /**
   * Rendszerengedély törlése azonosító alapján.
   */
  async remove(permitId: number): Promise<void> {
    const result = await this.permitRepo.delete(permitId);

    if (result.affected === 0) {
      throw new NotFoundException(`A(z) ${permitId} azonosítójú engedély nem található.`);
    }
  }

  /**
   * Rendszerengedély módosítása azonosító alapján.
   */
  async update(permitId: number, dto: UpdateSystemPermitDto): Promise<SystemPermit> {
    const permit = await this.permitRepo.findOneBy({ permit_id: permitId });

    if (!permit) {
      throw new NotFoundException(`A(z) ${permitId} azonosítójú engedély nem található.`);
    }

    // Update primitive properties from the DTO
    if (dto.engedely_szam) permit.engedely_szam = dto.engedely_szam;
    if (dto.kerelem_szam) permit.kerelem_szam = dto.kerelem_szam;
    if (dto.kiallitas_datuma) permit.kiallitas_datuma = dto.kiallitas_datuma;
    if (dto.ervenyesseg_datuma) permit.ervenyesseg_datuma = dto.ervenyesseg_datuma;


    // Handle relations
    if ('nemzeti_classification_id' in dto) {
      permit.nemzeti_classification = dto.nemzeti_classification_id
        ? await this.classificationRepo.findOneByOrFail({ classification_id: dto.nemzeti_classification_id })
        : null;
    }

    if ('nato_classification_id' in dto) {
      permit.nato_classification = dto.nato_classification_id
        ? await this.classificationRepo.findOneByOrFail({ classification_id: dto.nato_classification_id })
        : null;
    }
    
    if ('eu_classification_id' in dto) {
      permit.eu_classification = dto.eu_classification_id
        ? await this.classificationRepo.findOneByOrFail({ classification_id: dto.eu_classification_id })
        : null;
    }

    return this.permitRepo.save(permit);
  }
}