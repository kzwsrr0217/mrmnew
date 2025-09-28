// mrm-backend/src/documents/documents.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { Repository } from 'typeorm';
import { CreateDocumentDto } from './dto/create-document.dto';
import { System } from '../systems/system.entity';
import { createReadStream } from 'fs';
import * as path from 'path';
import { unlink } from 'fs/promises'; // <-- ÚJ IMPORT


@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(Document) private docRepo: Repository<Document>,
        @InjectRepository(System) private systemRepo: Repository<System>,
    ) {}

    async create(dto: CreateDocumentDto, filepath?: string): Promise<Document> {
        const system = await this.systemRepo.findOneBy({ systemid: dto.system_id });
        if (!system) {
            throw new NotFoundException('Rendszer nem található.');
        }

        const document = this.docRepo.create({
            ...dto,
            filepath,
            system,
        });
        
        // Itt jöhet majd a logika, ami automatikusan 'Aktív'-ra állítja a rendszert.
        // Ezt a SystemsService-be érdemes tenni, és itt meghívni.

        return this.docRepo.save(document);
    }
    
    async download(id: number): Promise<{ fileStream: import('fs').ReadStream, filename: string }> {
        const document = await this.docRepo.findOneBy({ document_id: id });
        if (!document || !document.filepath) {
            throw new NotFoundException('Dokumentum vagy a hozzá tartozó fájl nem található.');
        }
        
        const fileStream = createReadStream(document.filepath);
        const filename = path.basename(document.filepath);
        
        return { fileStream, filename };
    }
        async remove(id: number): Promise<void> {
        const document = await this.docRepo.findOneBy({ document_id: id });
        if (!document) {
            throw new NotFoundException('A dokumentum nem található.');
        }

        // 1. Töröljük a fájlt a fizikai tárhelyről
        if (document.filepath) {
            try {
                await unlink(document.filepath);
            } catch (error) {
                console.error('Hiba a fájl törlésekor:', error);
                // Dönthetünk úgy, hogy itt nem állunk meg, csak naplózzuk a hibát,
                // és az adatbázis-bejegyzést mindenképp töröljük.
            }
        }
        
        // 2. Töröljük a bejegyzést az adatbázisból
        await this.docRepo.delete(id);
    }
      findAllForSystem(systemId: number): Promise<Document[]> {
    return this.docRepo.find({
      where: { system: { systemid: systemId } },
      order: { uploaded_at: 'DESC' },
    });
  }
}