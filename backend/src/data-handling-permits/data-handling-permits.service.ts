import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataHandlingPermit } from './data-handling-permit.entity';

@Injectable()
export class DataHandlingPermitsService {
  constructor(
    @InjectRepository(DataHandlingPermit)
    private permitRepository: Repository<DataHandlingPermit>,
  ) {}

  // ... (ide jönnek majd a CRUD service metódusok)

  async findOne(id: number): Promise<DataHandlingPermit> {
    const permit = await this.permitRepository.findOneBy({ id });
    if (!permit) {
      throw new NotFoundException(`Az engedély nem található: ${id}`);
    }
    return permit;
  }

  async savePermitFile(id: number, filePath: string, originalFilename: string) {
    const permit = await this.findOne(id);
    permit.file_path = filePath;
    permit.original_filename = originalFilename;
    return this.permitRepository.save(permit);
  }
}