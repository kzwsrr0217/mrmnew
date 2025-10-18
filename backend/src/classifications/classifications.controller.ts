// mrmnew/backend/src/classifications/classifications.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ClassificationsService } from './classifications.service';
import { CreateClassificationDto } from './dto/create-classification.dto';
import { UpdateClassificationDto } from './dto/update-classification.dto';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classificationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClassificationDto) {
    return this.classificationsService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classificationsService.remove(+id);
  }
}