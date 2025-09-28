// mrm-backend/src/classifications/classifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassificationLevel } from './classification.entity';
import { ClassificationsController } from './classifications.controller';
import { ClassificationsService } from './classifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClassificationLevel])],
  controllers: [ClassificationsController],
  providers: [ClassificationsService],
})
export class ClassificationsModule {}