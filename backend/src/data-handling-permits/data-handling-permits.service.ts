// mrmnew/backend/src/data-handling-permits/data-handling-permits.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DataHandlingPermit } from './data-handling-permit.entity';
import { CreateDataHandlingPermitDto } from './dto/create-data-handling-permit.dto';
import { UpdateDataHandlingPermitDto } from './dto/update-data-handling-permit.dto';
import { Location } from '../locations/location.entity';
import { ClassificationLevel } from '../classifications/classification.entity';

@Injectable()
export class DataHandlingPermitsService {
  constructor(
    @InjectRepository(DataHandlingPermit)
    private permitRepository: Repository<DataHandlingPermit>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(ClassificationLevel)
    private classificationRepository: Repository<ClassificationLevel>,
  ) {}

  async create(createDto: CreateDataHandlingPermitDto): Promise<DataHandlingPermit> {
    const { locationId, classification_level_ids, ...permitData } = createDto;

    const location = await this.locationRepository.findOneBy({ id: locationId });
    if (!location) {
      throw new NotFoundException(`A helyszín nem található: ${locationId}`);
    }

    let classificationLevels = [];
    if (classification_level_ids && classification_level_ids.length > 0) {
      classificationLevels = await this.classificationRepository.findBy({ id: In(classification_level_ids) });
    }

    const newPermit = this.permitRepository.create({
      ...permitData,
      location,
      classification_levels: classificationLevels,
    });

    return this.permitRepository.save(newPermit);
  }

  findAll(): Promise<DataHandlingPermit[]> {
    return this.permitRepository.find({ relations: ['location', 'classification_levels'] });
  }

  async findOne(id: number): Promise<DataHandlingPermit> {
    const permit = await this.permitRepository.findOne({
      where: { id },
      relations: ['location', 'classification_levels'],
    });
    if (!permit) {
      throw new NotFoundException(`Az engedély nem található: ${id}`);
    }
    return permit;
  }

  async update(id: number, updateDto: UpdateDataHandlingPermitDto): Promise<DataHandlingPermit> {
    const { locationId, classification_level_ids, ...permitData } = updateDto;
    const permit = await this.findOne(id); // Meglévő engedély betöltése

    // Alapadatok frissítése
    Object.assign(permit, permitData);

    if (locationId) {
      const location = await this.locationRepository.findOneBy({ id: locationId });
      if (!location) throw new NotFoundException(`A helyszín nem található: ${locationId}`);
      permit.location = location;
    }

    if (classification_level_ids) {
      permit.classification_levels = await this.classificationRepository.findBy({ id: In(classification_level_ids) });
    }
    
    return this.permitRepository.save(permit);
  }

  async remove(id: number): Promise<void> {
    const result = await this.permitRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Az engedély nem található: ${id}`);
    }
  }

  async savePermitFile(id: number, filePath: string, originalFilename: string) {
    const permit = await this.findOne(id);
    permit.file_path = filePath;
    permit.original_filename = originalFilename;
    return this.permitRepository.save(permit);
  }
}