// mrm-backend/src/documents/documents.controller.ts

import { Controller, Post, Body, UploadedFile, UseInterceptors, Get, Param, StreamableFile, Res, Delete, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentType } from './document.entity';
import type { Response } from 'express';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
      },
    }),
  }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any, // A @Body-t általános 'any' típusként fogadjuk, hogy kikerüljük a validációt
  ) {
    // Manuálisan létrehozzuk és validáljuk a DTO-t
    const dto = new CreateDocumentDto();
    dto.system_id = Number(body.system_id);
    dto.type = body.type;
    dto.registration_number = body.registration_number;
    // Itt további validációt is végezhetnénk, ha szükséges

    if (!file && (dto.type === DocumentType.RENDSZERENGEDELY || dto.type === DocumentType.UBSZ)) {
      throw new BadRequestException('Ehhez a dokumentumtípushoz kötelező fájlt csatolni.');
    }

    return this.documentsService.create(dto, file?.path);
  }

  @Get('for-system/:systemId')
  findAllForSystem(@Param('systemId') systemId: string) {
    return this.documentsService.findAllForSystem(+systemId);
  }

  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const { fileStream, filename } = await this.documentsService.download(+id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(fileStream);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.documentsService.remove(+id);
  }
}