// mrmnew/backend/src/logistics/logistics.seeder.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as csvParser from 'csv-parser';
import { LogisticsItem, LogisticsItemType } from './entities/logistics-item.entity';

@Injectable()
export class LogisticsSeeder {
  private readonly logger = new Logger(LogisticsSeeder.name);

  constructor(
    @InjectRepository(LogisticsItem)
    private logisticsItemRepo: Repository<LogisticsItem>,
  ) {}

  async seed() {
    const count = await this.logisticsItemRepo.count();
    if (count > 0) {
      this.logger.log('Logisztikai adatok már léteznek, a feltöltés kihagyva.');
      return;
    }

    this.logger.log('Logisztikai adatok feltöltése a CSV fájlokból...');
    await this.seedFromFile('524eszköz.XLSX - Sheet1.csv', LogisticsItemType.ESZKOZ);
    await this.seedFromFile('524 készlet.XLSX - Sheet1.csv', LogisticsItemType.KESZLET);
  }

  private seedFromFile(filename: string, type: LogisticsItemType): Promise<void> {
    return new Promise((resolve, reject) => {
      const filePath = path.join(process.cwd(), 'uploads', filename);
      const items: Partial<LogisticsItem>[] = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row: any) => {
          // JAVÍTVA: Eltávolítottuk a szigorú feltételeket, és alapértelmezett értékeket adunk meg.
          if (type === LogisticsItemType.ESZKOZ) {
            items.push({
              type: LogisticsItemType.ESZKOZ,
              logistics_id: row['HETK kód'] || null,
              material_code: row['Anyagnem'] || null,
              name: row['Megnevezés'] || 'Ismeretlen eszköz',
              serial_number: row['Gyártási szám'] || null,
              quantity: 1,
              location: row['Telephely'] || 'Ismeretlen hely',
            });
          } else { // KÉSZLET
            items.push({
              type: LogisticsItemType.KESZLET,
              material_code: row['Anyag'] || null,
              name: row['Anyag rövid szövege'] || 'Ismeretlen készlet',
              quantity: parseInt(row['Szabadon használható'], 10) || 0,
              location: row['Szállító'] || 'Ismeretlen hely', // A 'Szállító' oszlopot használjuk telephelyként
            });
          }
        })
        .on('end', async () => {
          try {
            await this.logisticsItemRepo.save(items);
            this.logger.log(`${filename} feldolgozva, ${items.length} tétel hozzáadva.`);
            resolve();
          } catch (error) {
            this.logger.error(`Hiba a(z) ${filename} mentésekor:`, error);
            reject(error);
          }
        })
        .on('error', (error: any) => {
            this.logger.error(`Hiba a(z) ${filename} olvasásakor.`, error);
            reject(error);
        });
    });
  }
}