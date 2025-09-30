// mrmnew/backend/src/classifications/classifications.service.ts
import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassificationLevel, ClassificationType } from './classification.entity';
import { CreateClassificationDto } from './dto/create-classification.dto';
import { UpdateClassificationDto } from './dto/update-classification.dto';

@Injectable()
export class ClassificationsService implements OnModuleInit {
  constructor(
    @InjectRepository(ClassificationLevel)
    private repo: Repository<ClassificationLevel>,
  ) {}

  async onModuleInit() {
    const levels = [
        { type: ClassificationType.NEMZETI, level_name: 'Korlátozott terjesztésű!', rank: 10 },
        { type: ClassificationType.NEMZETI, level_name: 'Bizalmas!', rank: 20 },
        { type: ClassificationType.NEMZETI, level_name: 'Titkos!', rank: 30 },
        { type: ClassificationType.NEMZETI, level_name: 'Szigorúan Titkos!', rank: 40 },
        { type: ClassificationType.NATO, level_name: 'NATO RESTRICTED', rank: 10 },
        { type: ClassificationType.NATO, level_name: 'NATO CONFIDENTIAL', rank: 20 },
        { type: ClassificationType.NATO, level_name: 'NATO SECRET', rank: 30 },
        { type: ClassificationType.NATO, level_name: 'COSMIC TOP SECRET', rank: 40 },
        { type: ClassificationType.EU, level_name: 'RESTREINT UE/EU RESTRICTED', rank: 10 },
        { type: ClassificationType.EU, level_name: 'CONFIDENTIEL UE/EU CONFIDENTIAL', rank: 20 },
        { type: ClassificationType.EU, level_name: 'SECRET UE/EU SECRET', rank: 30 },
        { type: ClassificationType.EU, level_name: 'TRÈS SECRET UE/EU TOP SECRET', rank: 40 },
    ];

    for (const level of levels) {
      const existing = await this.repo.findOneBy({ type: level.type, level_name: level.level_name });
      if (!existing) {
        await this.repo.save(this.repo.create(level));
      } else if (existing.rank !== level.rank) {
        existing.rank = level.rank;
        await this.repo.save(existing);
      }
    }
  }

  create(dto: CreateClassificationDto): Promise<ClassificationLevel> {
    const level = this.repo.create(dto);
    return this.repo.save(level);
  }

  findAll(): Promise<ClassificationLevel[]> {
    return this.repo.find({ order: { type: 'ASC', rank: 'ASC' } });
  }

  async findOne(id: number): Promise<ClassificationLevel> {
    const level = await this.repo.findOneBy({ id });
    if (!level) {
      throw new NotFoundException(`A minősítési szint nem található: ${id}`);
    }
    return level;
  }

  async update(id: number, dto: UpdateClassificationDto): Promise<ClassificationLevel> {
    const level = await this.findOne(id);
    Object.assign(level, dto);
    return this.repo.save(level);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`A minősítési szint nem található: ${id}`);
    }
  }
}