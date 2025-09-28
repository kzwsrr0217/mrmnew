// mrm-backend/src/systems/systems.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemsService } from './systems.service';
import { SystemsController } from './systems.controller';
import { System } from './system.entity';

@Module({
  imports: [TypeOrmModule.forFeature([System])], // <- Entitás regisztrálása
  providers: [SystemsService],
  controllers: [SystemsController],
})
export class SystemsModule {}