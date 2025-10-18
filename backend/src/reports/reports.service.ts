// mrmnew/backend/src/reports/reports.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalSecurityData } from '../personal-security-data/personal-security-data.entity';
import { SystemPermit } from '../system-permits/system-permit.entity';
import { SystemAccess } from 'src/system-access/system-access.entity';
import { Hardware, HardwareType } from 'src/hardware/hardware.entity'; // <-- HardwareType IMPORTÁLÁSA

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(PersonalSecurityData)
    private psdRepository: Repository<PersonalSecurityData>,
    @InjectRepository(SystemPermit)
    private permitRepository: Repository<SystemPermit>,
    @InjectRepository(SystemAccess)
    private accessRepository: Repository<SystemAccess>,
    @InjectRepository(Hardware)
    private readonly hardwareRepository: Repository<Hardware>,
  ) {}

  // ... (a meglévő findExpiringCertificates, findExpiringPermits, findAccessReport metódusok változatlanok) ...
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
  }

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
  
  /**
   * Lekérdezi egy adott rendszer hardver elemeit, csoportosítva a "Rendszerelem táblázat" riport számára.
   */
  async getSystemElementsReport(systemId: number): Promise<any> {
    const hardwareList = await this.hardwareRepository.find({
      where: { system: { systemid: systemId } },
      relations: ['location'],
      order: { type: 'ASC', workstation_type: 'ASC' },
    });

    if (!hardwareList || hardwareList.length === 0) {
      return [];
    }

    const grouped = new Map<string, Hardware[]>();

    hardwareList.forEach(hw => {
      // JAVÍTVA: Az enumot használjuk a sima string helyett az összehasonlításhoz
      const key = hw.type === HardwareType.MUNKAALLOMAS && hw.workstation_type ? `${hw.type}_${hw.workstation_type}` : hw.type;
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(hw);
    });

    const reportData = Array.from(grouped.entries()).map(([key, items]) => {
      const firstItem = items[0];
      // JAVÍTVA: A groupName változót explicit string-ként kezeljük
      let groupName: string = firstItem.type; 
      // JAVÍTVA: Az enumot használjuk a sima string helyett
      if (firstItem.type === HardwareType.MUNKAALLOMAS && firstItem.workstation_type) {
        groupName += ` (Jelleg: ${firstItem.workstation_type})`;
      }

      return {
        groupName: groupName,
        count: items.length,
        items: items.map(item => ({
          // JAVÍTVA: A helyes property nevet, a 'hardware_id'-t használjuk
          id: item.hardware_id, 
          serial_number: item.serial_number || 'N/A',
          certificate: 'N/A',
          operating_location: item.location?.full_address || 'Ismeretlen',
          storage_location: 'N/A',
        })),
      };
    });

    return reportData;
  }
}