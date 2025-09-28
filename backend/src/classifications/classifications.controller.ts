// mrm-backend/src/classifications/classifications.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ClassificationsService } from './classifications.service';
import { CreateClassificationDto } from './dto/create-classification.dto';

@Controller('classifications')
export class ClassificationsController {
  constructor(private readonly classificationsService: ClassificationsService) {}

  @Post()
  create(@Body() dto: CreateClassificationDto) {
    return this.classificationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.classificationsService.findAll();
  }
}