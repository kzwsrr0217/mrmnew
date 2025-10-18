// mrmnew/backend/src/locations/locations.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationsRepository: Repository<Location>,
  ) {}

  create(createLocationDto: Partial<Omit<Location, 'id' | 'full_address'>>): Promise<Location> {
    const location = this.locationsRepository.create(createLocationDto);
    return this.locationsRepository.save(location);
  }

  // --- JAVÍTVA: A 'hardware' reláció betöltése ---
  findAll(): Promise<Location[]> {
    return this.locationsRepository.find({
      relations: ['hardware'], // Ez a sor tölti be a kapcsolódó hardvereket
    });
  }

  findOne(id: number): Promise<Location> {
    return this.locationsRepository.findOne({ 
        where: { id },
        relations: ['hardware'], // A részletes nézethez is hozzáadjuk
    });
  }

  async update(id: number, updateLocationDto: Partial<Omit<Location, 'id' | 'full_address'>>): Promise<Location> {
    // A 'findOne' már tartalmazza a relációkat, így a visszatérési érték teljes lesz.
    await this.locationsRepository.update(id, updateLocationDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.locationsRepository.delete(id);
  }
}