// mrmnew/backend/src/documents/documents.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { Repository } from 'typeorm';
import { CreateDocumentDto } from './dto/create-document.dto';
import { System } from '../systems/system.entity';
import { createReadStream } from 'fs';
import * as path from 'path';
import { unlink } from 'fs/promises';
import { User } from 'src/users/user.entity';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(Document) private docRepo: Repository<Document>,
        @InjectRepository(System) private systemRepo: Repository<System>,
    ) {}

    // --- JAVÍTOTT CREATE METÓDUS ---
    async create(dto: CreateDocumentDto, user: User, filepath?: string): Promise<Document> {
        const system = await this.systemRepo.findOneBy({ systemid: dto.system_id });
        if (!system) {
            throw new NotFoundException('Rendszer nem található.');
        }

        // Manuálisan hozzuk létre az új entitást ahelyett, hogy a .create()-re bíznánk
        const document = new Document();
        document.type = dto.type;
        document.registration_number = dto.registration_number;
        document.issue_date = dto.issue_date;
        document.handler_name = dto.handler_name;
        document.filepath = filepath;
        document.system = system;
        document.uploader = user;
        
        return this.docRepo.save(document);
    }
    
    findAllForSystem(systemId: number): Promise<Document[]> {
        return this.docRepo.find({
            where: { system: { systemid: systemId } },
            relations: ['uploader'],
            order: { uploaded_at: 'DESC' },
        });
    }

    // A download és remove metódusok változatlanok
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

        if (document.filepath) {
            try {
                await unlink(document.filepath);
            } catch (error) {
                console.error('Hiba a fájl törlésekor:', error);
            }
        }
        
        await this.docRepo.delete(id);
    }
}