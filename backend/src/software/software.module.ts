// mrm-backend/src/software/software.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Software } from './software.entity';
import { SoftwareController } from './software.controller';
import { SoftwareService } from './software.service';

@Module({
  imports: [TypeOrmModule.forFeature([Software])],
  controllers: [SoftwareController],
  providers: [SoftwareService],
})
export class SoftwareModule {}