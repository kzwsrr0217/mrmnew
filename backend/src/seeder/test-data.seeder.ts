// mrmnew/backend/src/seeder/test-data.seeder.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ClassificationLevel, ClassificationType } from '../classifications/classification.entity';
import { Hardware, HardwareType, StorageType, WorkstationType } from '../hardware/hardware.entity';
import { Personel } from '../personel/personel.entity';
import { PersonalSecurityData } from '../personal-security-data/personal-security-data.entity';
import { Software } from '../software/software.entity';
import { SystemAccess, AccessLevel } from '../system-access/system-access.entity';
import { SystemPermit } from '../system-permits/system-permit.entity';
import { System } from '../systems/system.entity';

@Injectable()
export class TestDataSeeder {
  private readonly logger = new Logger(TestDataSeeder.name);

  constructor(
    @InjectRepository(Software) private softwareRepo: Repository<Software>,
    @InjectRepository(System) private systemRepo: Repository<System>,
    @InjectRepository(Hardware) private hardwareRepo: Repository<Hardware>,
    @InjectRepository(SystemPermit) private permitRepo: Repository<SystemPermit>,
    @InjectRepository(ClassificationLevel) private classificationRepo: Repository<ClassificationLevel>,
    @InjectRepository(Personel) private personelRepo: Repository<Personel>,
    @InjectRepository(SystemAccess) private accessRepo: Repository<SystemAccess>,
  ) {}

  async seed() {
    this.logger.log('Tesztadatok feltöltésének ellenőrzése...');

    const personelCount = await this.personelRepo.count();
    if (personelCount > 0) {
      this.logger.log('Az adatbázis már tartalmaz tesztadatokat. A feltöltés kihagyva.');
      return;
    }

    const classifications = await this.classificationRepo.find();
    const software = await this.seedSoftware();
    const systems = await this.seedSystems(classifications);
    await this.seedHardware(systems, software);
    const personel = await this.seedPersonnel(classifications);
    await this.seedAccess(personel, systems);

    this.logger.log('Tesztadatok feltöltése sikeresen befejeződött.');
  }

  private async seedSoftware(): Promise<Software[]> {
    this.logger.log('Szoftverkatalógus feltöltése...');
    const softwareToCreate = [
      { name: 'Windows Server 2022', version: '21H2' },
      { name: 'Ubuntu Server', version: '22.04 LTS' },
      { name: 'Microsoft Office', version: '2021' },
      { name: 'Adobe Acrobat Reader', version: 'DC' },
      { name: 'VMware vSphere', version: '8.0' },
      { name: 'Veeam Backup & Replication', version: '12' },
      { name: 'Microsoft SQL Server', version: '2019' },
      { name: 'PostgreSQL', version: '15' },
      { name: 'NGINX', version: '1.24' },
      { name: 'Docker Engine', version: '20.10' },
    ];
    const softwareEntities = this.softwareRepo.create(softwareToCreate);
    return this.softwareRepo.save(softwareEntities);
  }

  private async seedSystems(classifications: ClassificationLevel[]): Promise<System[]> {
    this.logger.log('Rendszerek és engedélyek feltöltése...');
    const natoSecret = classifications.find(c => c.level_name === 'NATO SECRET');
    const nemzetiTitkos = classifications.find(c => c.level_name === 'Titkos!');

    const systemsToCreate = [
      { name: 'Vezetői Információs Rendszer (VIR)', desc: 'Döntéstámogató rendszer a vezetők számára.', permitNumber: 'A-123/2022', classification: natoSecret },
      { name: 'Logisztikai Adatbázis (LOG-DB)', desc: 'Készletnyilvántartó és ellátási lánc menedzsment.', permitNumber: 'B-456/2021', classification: nemzetiTitkos },
      { name: 'HR Portál', desc: 'Személyügyi nyilvántartó rendszer.', permitNumber: 'C-789/2023', classification: null },
      { name: 'Térinformatikai Adatbázis (TIR)', desc: 'Térképi adatok és elemzések.', permitNumber: 'D-101/2020', classification: natoSecret },
      { name: 'Gyakorlat Tervező Szoftver (GYAK-TERV)', desc: 'Műveleti tervezést támogató alkalmazás.', permitNumber: 'E-112/2024', classification: nemzetiTitkos },
      // ... további 5 rendszer ...
      { name: 'Pénzügyi Elszámoló Rendszer', desc: 'Költségvetési és pénzügyi tranzakciók.', permitNumber: 'F-213/2022', classification: null },
      { name: 'Oktatási Portál', desc: 'E-learning és tananyag menedzsment.', permitNumber: 'G-314/2021', classification: null },
      { name: 'Dokumentumtár', desc: 'Szabályozók és hivatalos iratok tárolása.', permitNumber: 'H-415/2023', classification: nemzetiTitkos },
      { name: 'Incidens Kezelő Rendszer', desc: 'IT és biztonsági incidensek naplózása.', permitNumber: 'I-516/2020', classification: natoSecret },
      { name: 'Archiváló Rendszer', desc: 'Régi adatok hosszú távú megőrzése.', permitNumber: 'J-617/2024', classification: null },
    ];

    const createdSystems: System[] = [];
    for (const sys of systemsToCreate) {
      const systemEntity = this.systemRepo.create({
        systemname: sys.name,
        description: sys.desc,
        status: 'Aktív',
      });
      const savedSystem = await this.systemRepo.save(systemEntity);

      const permitEntity = this.permitRepo.create({
        engedely_szam: sys.permitNumber,
        kiallitas_datuma: new Date('2023-01-15'),
        ervenyesseg_datuma: new Date('2026-01-14'),
        system: savedSystem,
        nemzeti_classification: sys.classification?.type === ClassificationType.NEMZETI ? sys.classification : null,
        nato_classification: sys.classification?.type === ClassificationType.NATO ? sys.classification : null,
      });
      await this.permitRepo.save(permitEntity);
      createdSystems.push(savedSystem);
    }
    return createdSystems;
  }

  private async seedHardware(systems: System[], software: Software[]) {
    this.logger.log('Hardverek feltöltése...');
    for(const system of systems) {
        const server = this.hardwareRepo.create({
            type: HardwareType.SZERVER,
            manufacturer: 'HPE',
            model_name: `ProLiant DL380 Gen10 - ${system.systemname}`,
            serial_number: `SRV-${system.systemid}-${Math.floor(Math.random() * 9000) + 1000}`,
            system: system,
            installed_software: [software[0], software[6]]
        });
        await this.hardwareRepo.save(server);

        const workstation = this.hardwareRepo.create({
            type: HardwareType.MUNKAALLOMAS,
            workstation_type: WorkstationType.ASZTALI,
            manufacturer: 'Dell',
            model_name: 'OptiPlex 7080',
            serial_number: `WS-${system.systemid}-${Math.floor(Math.random() * 9000) + 1000}`,
            system: system,
            installed_software: [software[2], software[3]]
        });
        await this.hardwareRepo.save(workstation);
    }
  }

  private async seedPersonnel(classifications: ClassificationLevel[]): Promise<Personel[]> {
    this.logger.log('Személyi állomány feltöltése...');
    const natoSecret = classifications.find(c => c.level_name === 'NATO SECRET');
    const nemzetiTitkos = classifications.find(c => c.level_name === 'Titkos!');

    const personnelToCreate = [
      // Hamarosan lejáró (SZBF ticketet kell kapjon)
      { nev: 'Tesztes Elek', rendfokozat: 'őrnagy', szbt_lejarat: this.addMonths(new Date(), 5), nemzeti_szint: nemzetiTitkos },
      { nev: 'Minta Mónika', rendfokozat: 'százados', nato_lejarat: this.addMonths(new Date(), 3), nato_szint: natoSecret },
      // Lejárt (RBF ticketet kell kapjon és a hozzáférését törölni kell)
      { nev: 'Lejárt Levente', rendfokozat: 'törzsőrmester', szbt_lejarat: this.addMonths(new Date(), -2), nemzeti_szint: nemzetiTitkos },
      // További 17 felhasználó érvényes tanúsítvánnyal
      ...Array.from({ length: 17 }, (_, i) => ({
        nev: `Próba Péter ${i+1}`,
        rendfokozat: 'alezredes',
        szbt_lejarat: this.addMonths(new Date(), 12 + i),
        nemzeti_szint: nemzetiTitkos,
        nato_lejarat: this.addMonths(new Date(), 24 + i),
        nato_szint: natoSecret
      }))
    ];

    const createdPersonnel: Personel[] = [];
    for (const p of personnelToCreate) {
      const psd = new PersonalSecurityData();
      psd.rendfokozat = p.rendfokozat;
      psd.beosztas = 'beosztás';
      psd.szbt_lejarat = p.szbt_lejarat as Date;
      psd.nemzeti_szint = p.nemzeti_szint || null;
      psd.nato_lejarat = p.nato_lejarat as Date;
      psd.nato_szint = p.nato_szint || null;

      const personel = this.personelRepo.create({
        nev: p.nev,
        personal_security_data: psd,
      });
      createdPersonnel.push(await this.personelRepo.save(personel));
    }
    return createdPersonnel;
  }

  private async seedAccess(personel: Personel[], systems: System[]) {
    this.logger.log('Hozzáférések beállítása...');
    const accesses: Partial<SystemAccess>[] = [];
    for (let i = 0; i < personel.length; i++) {
        // Minden második személy kap hozzáférést a VIR rendszerhez
        if (i % 2 === 0) {
            accesses.push({ personel: personel[i], system: systems[0], access_level: AccessLevel.USER });
        }
        // Minden harmadik a LOG-DB-hez
        if (i % 3 === 0) {
            accesses.push({ personel: personel[i], system: systems[1], access_level: AccessLevel.RBF });
        }
    }
    const accessEntities = this.accessRepo.create(accesses);
    await this.accessRepo.save(accessEntities);
  }

  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }
}