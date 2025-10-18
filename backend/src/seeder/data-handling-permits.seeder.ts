// mrmnew/backend/src/seeder/data-handling-permits.seeder.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataHandlingPermit, SecurityClass } from '../data-handling-permits/data-handling-permit.entity';
import { Repository } from 'typeorm';
import { Location } from '../locations/location.entity';
import { ClassificationLevel } from '../classifications/classification.entity';

@Injectable()
export class DataHandlingPermitSeederService {
  constructor(
    @InjectRepository(DataHandlingPermit)
    private readonly permitRepository: Repository<DataHandlingPermit>,
    @InjectRepository(ClassificationLevel)
    private readonly classificationRepository: Repository<ClassificationLevel>,
  ) {}

  async seed(locations: Location[]) {
    const serverRoomLocation = locations.find(loc => loc.room === '102-es szerverszoba');
    const commandRoomLocation = locations.find(loc => loc.room === 'parancsnoki iroda');

    const natoSecret = await this.classificationRepository.findOneBy({ level_name: 'NATO SECRET' });
    const nemzetiTitkos = await this.classificationRepository.findOneBy({ level_name: 'Titkos!' });

    if (serverRoomLocation && natoSecret && nemzetiTitkos) {
      const permitData = {
        registration_number: 'AKE-SZVT-001/2025',
        security_class: SecurityClass.FIRST_CLASS,
        notes: 'Folyamatos fizikai és elektronikus felügyelet alatt.',
        location: serverRoomLocation,
        classification_levels: [natoSecret, nemzetiTitkos],
      };

      const existing = await this.permitRepository.findOneBy({ registration_number: permitData.registration_number });
      if (!existing) {
        const newPermit = this.permitRepository.create(permitData);
        await this.permitRepository.save(newPermit);
      }
    }
    
    // Itt adhatsz hozzá további engedélyeket a többi helyszínhez, ha szeretnél.

    console.log('Data Handling Permit seeding complete.');
  }
}