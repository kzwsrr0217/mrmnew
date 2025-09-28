import { Controller, Post, Body, Param, UploadedFile, UseInterceptors, Get, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DataHandlingPermitsService } from './data-handling-permits.service';
import { CreateDataHandlingPermitDto } from './dto/create-data-handling-permit.dto';
import { Response } from 'express';
import { join } from 'path';

@Controller('data-handling-permits')
export class DataHandlingPermitsController {
  constructor(private readonly permitsService: DataHandlingPermitsService) {}

  // ... (ide jönnek majd a CRUD műveletek: GET, POST, PATCH, DELETE)

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/permits',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
      },
    }),
  }))
  async uploadPermitFile(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.permitsService.savePermitFile(id, file.path, file.originalname);
  }

  @Get(':id/download')
  async downloadPermitFile(@Param('id') id: number, @Res() res: Response) {
    const permit = await this.permitsService.findOne(id);
    if (!permit || !permit.file_path) {
      return res.status(404).send('A fájl nem található.');
    }
    const filePath = join(process.cwd(), permit.file_path);
    return res.download(filePath, permit.original_filename);
  }
}