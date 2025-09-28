// mrm-backend/src/software/software.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Software } from './software.entity';
import { Repository } from 'typeorm';
import { CreateSoftwareDto } from './dto/create-software.dto';

@Injectable()
export class SoftwareService {
  constructor(
    @InjectRepository(Software) private softwareRepo: Repository<Software>,
  ) {}

  // Új szoftver létrehozása a katalógusban
  create(dto: CreateSoftwareDto): Promise<Software> {
    const software = this.softwareRepo.create(dto);
    return this.softwareRepo.save(software);
  }

  // Az összes szoftver lekérdezése a katalógusból
  findAll(): Promise<Software[]> {
    return this.softwareRepo.find();
  }
}