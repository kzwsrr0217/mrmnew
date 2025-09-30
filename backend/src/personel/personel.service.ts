import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Personel } from './personel.entity';
import { Repository } from 'typeorm';
import { CreatePersonelDto } from './dto/create-personel.dto';
import { PersonalSecurityData } from '../personal-security-data/personal-security-data.entity';
import { ClassificationLevel } from '../classifications/classification.entity';
import { UpdatePersonelDto } from './dto/update-personel.dto';

@Injectable()
export class PersonelService {
  constructor(
    @InjectRepository(Personel) private personelRepo: Repository<Personel>,
    @InjectRepository(PersonalSecurityData) private psdRepo: Repository<PersonalSecurityData>,
    @InjectRepository(ClassificationLevel) private classificationRepo: Repository<ClassificationLevel>,
  ) {}

  // --- A create, findAll, findOne, update metódusok VÁLTOZATLANOK ---
  async create(dto: CreatePersonelDto): Promise<Personel> {
    const psd = this.psdRepo.create(dto.personal_security_data);

    if (dto.personal_security_data.nemzeti_szint_id) {
      psd.nemzeti_szint = await this.classificationRepo.findOneByOrFail({ classification_id: dto.personal_security_data.nemzeti_szint_id });
    }
    if (dto.personal_security_data.nato_szint_id) {
        psd.nato_szint = await this.classificationRepo.findOneByOrFail({ classification_id: dto.personal_security_data.nato_szint_id });
    }
    if (dto.personal_security_data.eu_szint_id) {
        psd.eu_szint = await this.classificationRepo.findOneByOrFail({ classification_id: dto.personal_security_data.eu_szint_id });
    }

    const personel = this.personelRepo.create({
      nev: dto.nev,
      personal_security_data: psd,
    });

    return this.personelRepo.save(personel);
  }

  findAll(): Promise<Personel[]> {
    return this.personelRepo.find({
      relations: {
        personal_security_data: {
          nemzeti_szint: true,
          nato_szint: true,
          eu_szint: true,
        },
      },
    });
  }

  async findOne(id: number): Promise<Personel> {
    const personel = await this.personelRepo.findOne({
      where: { personel_id: id },
      relations: {
        personal_security_data: {
          nemzeti_szint: true,
          nato_szint: true,
          eu_szint: true,
        },
      },
    });
    if (!personel) {
      throw new NotFoundException(`Személy a(z) ${id} azonosítóval nem található.`);
    }
    return personel;
  }
  
  async update(id: number, dto: UpdatePersonelDto): Promise<Personel> {
    const personel = await this.findOne(id);

    if (dto.nev) {
      personel.nev = dto.nev;
    }

    if (dto.personal_security_data) {
      const psdDto = dto.personal_security_data;
      const psd = personel.personal_security_data;

      if (psdDto.beosztas) psd.beosztas = psdDto.beosztas;
      if (psdDto.rendfokozat) psd.rendfokozat = psdDto.rendfokozat;
      if (psdDto.titoktartasi_szam) psd.titoktartasi_szam = psdDto.titoktartasi_szam;
      if (psdDto.szbt_datum) psd.szbt_datum = psdDto.szbt_datum;
      if (psdDto.szbt_lejarat) psd.szbt_lejarat = psdDto.szbt_lejarat;
      if (psdDto.nato_datum) psd.nato_datum = psdDto.nato_datum;
      if (psdDto.nato_lejarat) psd.nato_lejarat = psdDto.nato_lejarat;
      if (psdDto.eu_datum) psd.eu_datum = psdDto.eu_datum;
      if (psdDto.eu_lejarat) psd.eu_lejarat = psdDto.eu_lejarat;

      if ('nemzeti_szint_id' in psdDto) {
        psd.nemzeti_szint = psdDto.nemzeti_szint_id
          ? await this.classificationRepo.findOneByOrFail({ classification_id: psdDto.nemzeti_szint_id })
          : null;
      }
      if ('nato_szint_id' in psdDto) {
        psd.nato_szint = psdDto.nato_szint_id
          ? await this.classificationRepo.findOneByOrFail({ classification_id: psdDto.nato_szint_id })
          : null;
      }
      if ('eu_szint_id' in psdDto) {
        psd.eu_szint = psdDto.eu_szint_id
          ? await this.classificationRepo.findOneByOrFail({ classification_id: psdDto.eu_szint_id })
          : null;
      }
    }

    return this.personelRepo.save(personel);
  }

  // --- EZ A FÜGGVÉNY MÓDOSULT ---
  async remove(id: number): Promise<void> {
    try {
      const result = await this.personelRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`A(z) ${id} azonosítójú személy nem található.`);
      }
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new ConflictException('A személy nem törölhető, mert még rendelkezik aktív rendszerhozzáféréssel.');
      }
      // Dobja tovább az egyéb, nem várt hibákat
      throw error;
    }
  }
}