// mrmnew/backend/src/software/software.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Software } from './software.entity';
import { Repository } from 'typeorm';
import { CreateSoftwareDto } from './dto/create-software.dto';
import { UpdateSoftwareDto } from './dto/update-software.dto'; // <-- ÚJ IMPORT

@Injectable()
export class SoftwareService {
  constructor(
    @InjectRepository(Software) private softwareRepo: Repository<Software>,
  ) {}

  create(dto: CreateSoftwareDto): Promise<Software> {
    const software = this.softwareRepo.create(dto);
    return this.softwareRepo.save(software);
  }

  findAll(): Promise<Software[]> {
    return this.softwareRepo.find({ order: { name: 'ASC' } });
  }

  // --- ÚJ METÓDUSOK ---

  async findOne(id: number): Promise<Software> {
    const software = await this.softwareRepo.findOneBy({ software_id: id });
    if (!software) {
      throw new NotFoundException(`A(z) ${id} azonosítójú szoftver nem található.`);
    }
    return software;
  }

  async update(id: number, dto: UpdateSoftwareDto): Promise<Software> {
    const software = await this.findOne(id);
    Object.assign(software, dto);
    return this.softwareRepo.save(software);
  }

  async remove(id: number): Promise<void> {
    const result = await this.softwareRepo.delete(id);
    if (result.affected === 0) {
        throw new NotFoundException(`A(z) ${id} azonosítójú szoftver nem található.`);
    }
  }
}