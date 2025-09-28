// mrmnew/backend/src/reports/reports.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalSecurityData } from '../personal-security-data/personal-security-data.entity';
import { SystemPermit } from '../system-permits/system-permit.entity';
import { SystemAccess } from 'src/system-access/system-access.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(PersonalSecurityData)
    private psdRepository: Repository<PersonalSecurityData>,
    @InjectRepository(SystemPermit)
    private permitRepository: Repository<SystemPermit>,
    @InjectRepository(SystemAccess)
    private accessRepository: Repository<SystemAccess>,
  ) {}

  /**
   * Lekérdezi azokat a személyeket, akiknek a tanúsítványa
   * a megadott hónapon belül lejár.
   */
  async findExpiringCertificates(months: number): Promise<any[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(today.getMonth() + months);

    const results = await this.psdRepository.createQueryBuilder("psd")
      .innerJoinAndSelect("psd.personel", "personel")
      .where("psd.szbt_lejarat BETWEEN :today AND :futureDate", { today, futureDate })
      .orWhere("psd.nato_lejarat BETWEEN :today AND :futureDate", { today, futureDate })
      .orWhere("psd.eu_lejarat BETWEEN :today AND :futureDate", { today, futureDate })
      .orderBy("personel.nev", "ASC")
      .getMany();
      
    return results.map(psd => ({
        nev: psd.personel.nev,
        rendfokozat: psd.rendfokozat,
        beosztas: psd.beosztas,
        szbt_lejarat: psd.szbt_lejarat,
        nato_lejarat: psd.nato_lejarat,
        eu_lejarat: psd.eu_lejarat
    }));
  }

  /**
   * Lekérdezi azokat a rendszereket, amelyeknek az engedélye
   * a megadott hónapon belül lejár.
   */
  async findExpiringPermits(months: number): Promise<any[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(today.getMonth() + months);

    const results = await this.permitRepository.createQueryBuilder("permit")
      .innerJoinAndSelect("permit.system", "system")
      .where("permit.ervenyesseg_datuma BETWEEN :today AND :futureDate", { today, futureDate })
      .orderBy("system.systemname", "ASC")
      .getMany();
      
    return results.map(permit => ({
        systemname: permit.system.systemname,
        status: permit.system.status,
        engedely_szam: permit.engedely_szam,
        ervenyesseg_datuma: permit.ervenyesseg_datuma
    }));
  } // <-- EZ A ZÁRÓJEL HIÁNYZOTT

  /**
   * Hozzáférési jelentést készít.
   * Szűrhető személyre vagy rendszerre.
   */
  async findAccessReport(personelId?: number, systemId?: number): Promise<any[]> {
    const query = this.accessRepository.createQueryBuilder("access")
      .innerJoinAndSelect("access.personel", "personel")
      .innerJoinAndSelect("access.system", "system")
      .orderBy("personel.nev", "ASC")
      .addOrderBy("system.systemname", "ASC");

    if (personelId) {
      query.where("personel.personel_id = :personelId", { personelId });
    }

    if (systemId) {
      query.where("system.systemid = :systemId", { systemId });
    }
    
    const results = await query.getMany();

    return results.map(access => ({
        personel_nev: access.personel.nev,
        system_name: access.system.systemname,
        access_level: access.access_level,
    }));
  }
}