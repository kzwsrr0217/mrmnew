// mrm-backend/src/systems/systems.controller.ts

import { Controller, Get, Post, Body, Param, Delete, NotFoundException } from '@nestjs/common';
import { SystemsService } from './systems.service';
import { System } from './system.entity';
import { CreateSystemDto } from './dto/create-system.dto'; // <-- ÚJ IMPORT


@Controller('systems')
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) {}

  @Post()
  create(@Body() createSystemDto: CreateSystemDto): Promise<System> { // <-- MÓDOSÍTVA
    return this.systemsService.create(createSystemDto);
  }

  @Get()
  findAll(): Promise<System[]> {
    return this.systemsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<System> {
    const system = await this.systemsService.findOne(+id);
    if (!system) {
      throw new NotFoundException(`System with ID "${id}" not found`);
    }
    return system;
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.systemsService.remove(+id);
  }

}
