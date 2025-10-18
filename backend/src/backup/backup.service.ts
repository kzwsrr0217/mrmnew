import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';

@Injectable()
export class BackupService {
  private baseDir = '/usr/src/app/db_backups';
  private dailyDir = path.join(this.baseDir, 'daily');

  // Segédfüggvény, ami biztosítja a mappák létezését
  private async ensureDirectories() {
    await fs.mkdir(path.join(this.baseDir, 'daily'), { recursive: true });
    await fs.mkdir(path.join(this.baseDir, 'weekly'), { recursive: true });
    await fs.mkdir(path.join(this.baseDir, 'monthly'), { recursive: true });
  }

  async listBackups() {
    await this.ensureDirectories(); // Először biztosítjuk, hogy a mappák léteznek
    const result = { daily: [], weekly: [], monthly: [] };
    
    for (const type of Object.keys(result)) {
        const dirPath = path.join(this.baseDir, type);
        try {
            const files = await fs.readdir(dirPath);
            for (const file of files) {
                const stats = await fs.stat(path.join(dirPath, file));
                result[type].push({
                    filename: file,
                    size: stats.size,
                    createdAt: stats.birthtime,
                });
            }
            result[type].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } catch (error) {
            console.error(`Hiba a(z) ${type} mappa olvasása közben:`, error);
        }
    }
    return result;
  }

  // JAVÍTOTT, MEGBÍZHATÓBB MENTÉSI METÓDUS
  triggerManualBackup(): Promise<string> {
    return new Promise(async (resolve, reject) => {
        await this.ensureDirectories(); // Biztosítjuk, hogy a célmappa létezik

        const date = new Date().toISOString().replace(/:/g, '-');
        const filename = path.join(this.dailyDir, `manual_backup_${date}.sql.gz`);
        
        // A környezeti változókat a NestJS process.env objektumából olvassuk.
        // Ezeket a docker-compose.yml-ben kell megadni a backend service-nek!
        const { MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;

        const command = `mysqldump -h ${MYSQL_HOST} -u ${MYSQL_USER} -p'${MYSQL_PASSWORD}' ${MYSQL_DATABASE} | gzip > ${filename}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Backup exec error: ${stderr}`);
                return reject(new InternalServerErrorException('A mentési parancs futtatása sikertelen.'));
            }
            resolve(`Sikeres manuális mentés a következő fájlba: ${path.basename(filename)}`);
        });
    });
  }
}