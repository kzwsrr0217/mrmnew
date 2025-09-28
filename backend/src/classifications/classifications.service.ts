// mrm-backend/src/classifications/classifications.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassificationLevel, ClassificationType } from './classification.entity';
import { CreateClassificationDto } from './dto/create-classification.dto';

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

  create(dto: CreateClassificationDto) {
    const level = this.repo.create(dto);
    return this.repo.save(level);
  }

  findAll() {
    return this.repo.find();
  }
}