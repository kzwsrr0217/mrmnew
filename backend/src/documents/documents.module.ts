// mrmnew/backend/src/documents/documents.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { System } from '../systems/system.entity';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { UsersModule } from 'src/users/users.module'; // <-- 1. ÚJ IMPORT

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, System]),
    UsersModule, // <-- 2. ADD HOZZÁ EZT A SORT
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}