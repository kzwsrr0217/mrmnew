// mrmnew/backend/src/seeder/locations.seeder.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Location } from '../locations/location.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LocationSeederService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async seed() {
    const locations = [
      { zip_code: '8200', city: 'Veszprém', address: 'Jutasi út', building: '10.', room: '101-es iroda' },
      { zip_code: '8200', city: 'Veszprém', address: 'Jutasi út', building: '10.', room: '102-es szerverszoba' },
      { zip_code: '8200', city: 'Veszprém', address: 'Kossuth Lajos utca', building: '5.', room: '2. emelet, 205.' },
      { zip_code: '8100', city: 'Várpalota', address: 'Fő út', building: '1.', room: 'parancsnoki iroda' },
    ];

    for (const locData of locations) {
      const existing = await this.locationRepository.findOneBy({ 
        building: locData.building, 
        room: locData.room 
      });

      if (!existing) {
        const newLocation = this.locationRepository.create(locData);
        await this.locationRepository.save(newLocation);
      }
    }
    console.log('Location seeding complete.');
    return this.locationRepository.find();
  }
}