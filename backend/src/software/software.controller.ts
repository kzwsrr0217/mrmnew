// mrm-backend/src/software/software.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { SoftwareService } from './software.service';
import { CreateSoftwareDto } from './dto/create-software.dto';

@Controller('software')
export class SoftwareController {
  constructor(private readonly softwareService: SoftwareService) {}

  @Post()
  create(@Body() dto: CreateSoftwareDto) {
    return this.softwareService.create(dto);
  }

  @Get()
  findAll() {
    return this.softwareService.findAll();
  }
}