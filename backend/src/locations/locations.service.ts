// mrmnew/backend/src/locations/locations.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Location } from './location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) {}

  // JAVÍTVA: Hiányzó 'create' metódus hozzáadása
  create(createLocationDto: Omit<Location, 'id'>): Promise<Location> {
    const location = this.locationsRepository.create(createLocationDto);
    return this.locationsRepository.save(location);
  }

  // JAVÍTVA: Hiányzó 'findAll' metódus hozzáadása
  findAll(): Promise<Location[]> {
    return this.locationsRepository.find();
  }

  // JAVÍTVA: Hiányzó 'findOne' metódus hozzáadása
  findOne(id: number): Promise<Location> {
    return this.locationsRepository.findOneBy({ id });
  }

  // JAVÍTVA: Hiányzó 'update' metódus hozzáadása
  async update(id: number, updateLocationDto: Partial<Omit<Location, 'id'>>): Promise<Location> {
    await this.locationsRepository.update(id, updateLocationDto);
    return this.findOne(id);
  }

  // JAVÍTVA: Hiányzó 'remove' metódus hozzáadása
  async remove(id: number): Promise<void> {
    await this.locationsRepository.delete(id);
  }
}