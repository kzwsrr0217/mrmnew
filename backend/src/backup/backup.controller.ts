import { Controller, Get, Post, Res, Param, StreamableFile, Header } from '@nestjs/common';
import { BackupService } from './backup.service';
import { Response } from 'express';
import { createReadStream } from 'fs';
import * as path from 'path';

@Controller('backups')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get()
  listBackups() {
    return this.backupService.listBackups();
  }

  @Post('now')
  triggerBackup() {
    return this.backupService.triggerManualBackup();
  }

  @Get('download/:type/:filename')
  @Header('Content-Type', 'application/gzip')
  downloadBackup(
    @Param('type') type: string,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    // Biztonsági ellenőrzés: csak a megengedett mappákból engedünk letöltést
    if (!['daily', 'weekly', 'monthly'].includes(type)) {
        throw new Error('Invalid backup type');
    }
    const filePath = path.join('/app/db_backups', type, filename);
    res.set({
        'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(createReadStream(filePath));
  }
}