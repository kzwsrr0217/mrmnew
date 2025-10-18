// mrmnew/backend/src/personel/personel.service.ts

import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Personel } from './personel.entity';
import { Repository, Like } from 'typeorm';
import { CreatePersonelDto } from './dto/create-personel.dto';
import { PersonalSecurityData } from '../personal-security-data/personal-security-data.entity';
import { ClassificationLevel } from '../classifications/classification.entity';
import { UpdatePersonelDto } from './dto/update-personel.dto';

@Injectable()
export class PersonelService {
  private readonly logger = new Logger(PersonelService.name);

  constructor(
    @InjectRepository(Personel) private personelRepo: Repository<Personel>,
    @InjectRepository(PersonalSecurityData) private psdRepo: Repository<PersonalSecurityData>,
    @InjectRepository(ClassificationLevel) private classificationRepo: Repository<ClassificationLevel>,
  ) {}

  async create(dto: CreatePersonelDto): Promise<Personel> {
    // 1. Hozzunk létre egy új, üres PersonalSecurityData objektumot
    const psd = new PersonalSecurityData();
    
    // 2. Töltsük fel az egyszerű, nem-relációs adatokkal a DTO-ból
    Object.assign(psd, dto.personal_security_data);

    // 3. Külön keressük meg és rendeljük hozzá a minősítési szinteket
    if (dto.personal_security_data.nemzeti_szint_id) {
      psd.nemzeti_szint = await this.classificationRepo.findOneByOrFail({ id: dto.personal_security_data.nemzeti_szint_id });
    }
    if (dto.personal_security_data.nato_szint_id) {
      psd.nato_szint = await this.classificationRepo.findOneByOrFail({ id: dto.personal_security_data.nato_szint_id });
    }
    if (dto.personal_security_data.eu_szint_id) {
      psd.eu_szint = await this.classificationRepo.findOneByOrFail({ id: dto.personal_security_data.eu_szint_id });
    }
    
    // 4. Hozzunk létre egy új Personel objektumot
    const personel = new Personel();
    personel.nev = dto.nev;
    personel.personal_security_data = psd; // Rendeljük hozzá a kézzel összerakott psd objektumot

    // 5. Mentsük el a Personel-t (a cascade:true miatt a psd is mentésre kerül)
    return this.personelRepo.save(personel);
  }

  findAll(search?: string): Promise<Personel[]> {
    const findOptions = {
        relations: {
            personal_security_data: {
                nemzeti_szint: true,
                nato_szint: true,
                eu_szint: true,
            },
        },
        where: {},
        order: { nev: 'ASC' } as any,
    };

    if (search) {
        // Ha van keresési kifejezés, a 'where' opciót kiegészítjük
        findOptions.where = {
            nev: Like(`%${search}%`) // SQL LIKE keresés
        };
    }

    return this.personelRepo.find(findOptions);
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
          // JAVÍTVA: classification_id -> id
          ? await this.classificationRepo.findOneByOrFail({ id: psdDto.nemzeti_szint_id })
          : null;
      }
      if ('nato_szint_id' in psdDto) {
        psd.nato_szint = psdDto.nato_szint_id
          // JAVÍTVA: classification_id -> id
          ? await this.classificationRepo.findOneByOrFail({ id: psdDto.nato_szint_id })
          : null;
      }
      if ('eu_szint_id' in psdDto) {
        psd.eu_szint = psdDto.eu_szint_id
          // JAVÍTVA: classification_id -> id
          ? await this.classificationRepo.findOneByOrFail({ id: psdDto.eu_szint_id })
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
async bulkImport(personelData: CreatePersonelDto[]): Promise<{ created: number; updated: number; errors: string[] }> {
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    const classifications = await this.classificationRepo.find();
    const classificationMap = new Map<string, number>();
    classifications.forEach(c => {
      const key = `${c.type.trim().toUpperCase()} ${c.level_name.trim().toUpperCase()}`;
      classificationMap.set(key, c.id);
    });

    // --- JAVÍTOTT DIAGNOSZTIKAI LOG ---
    this.logger.log('--- Betöltött minősítési szintek (kulcs: ID) ---');
    if (classificationMap.size === 0) {
        this.logger.warn('A "classificationMap" ÜRES! Nem lett egyetlen minősítési szint sem betöltve az adatbázisból. Ellenőrizd a "classification_levels" tábla tartalmát!');
        errors.push('HIBA: Nincsenek minősítési szintek az adatbázisban, az importálás nem lehetséges.');
        // Leállítjuk a feldolgozást, ha nincsenek szintek
        return { created, updated, errors };
    }
    // A Map tartalmának helyes kiíratása
    for (const [key, value] of classificationMap.entries()) {
      this.logger.log(`'${key}': ${value}`);
    }
    this.logger.log('----------------------------------------------------');


    for (const [index, personelDto] of personelData.entries()) {
      try {
        const psd = personelDto.personal_security_data;

        if (psd.nemzeti_szint) {
          const lookupKey = psd.nemzeti_szint.trim().toUpperCase();
          const id = classificationMap.get(lookupKey);
          if (id) psd.nemzeti_szint_id = id;
          else errors.push(`${personelDto.nev}: Ismeretlen Nemzeti szint: '${psd.nemzeti_szint}'`);
          delete psd.nemzeti_szint;
        }

        if (psd.nato_szint) {
          const lookupKey = psd.nato_szint.trim().toUpperCase();
          const id = classificationMap.get(lookupKey);
          if (id) psd.nato_szint_id = id;
          else errors.push(`${personelDto.nev}: Ismeretlen NATO szint: '${psd.nato_szint}'`);
          delete psd.nato_szint;
        }

        if (psd.eu_szint) {
          const lookupKey = psd.eu_szint.trim().toUpperCase();
          const id = classificationMap.get(lookupKey);
          if (id) psd.eu_szint_id = id;
          else errors.push(`${personelDto.nev}: Ismeretlen EU szint: '${psd.eu_szint}'`);
          delete psd.eu_szint;
        }
        
        const existingPersonel = await this.personelRepo.findOne({
          where: { nev: personelDto.nev },
          relations: ['personal_security_data'],
        });

        if (existingPersonel) {
          this.logger.log(`Frissítés: ${personelDto.nev}`);
          const psdData = Object.entries(psd)
            .reduce((acc, [key, value]) => (value != null ? { ...acc, [key]: value } : acc), {});

          Object.assign(existingPersonel.personal_security_data, psdData);
          await this.personelRepo.save(existingPersonel);
          updated++;
        } else {
          this.logger.log(`Létrehozás: ${personelDto.nev}`);
          await this.create(personelDto);
          created++;
        }
      } catch (error) {
        this.logger.error(`Hiba a(z) ${index + 1}. sor feldogozásakor (${personelDto.nev}): ${error.message}`);
        errors.push(`${personelDto.nev || `Ismeretlen név a ${index + 2}. Excel sorban`}: ${error.message}`);
      }
    }
    return { created, updated, errors };
}
}

