// mrm-backend/src/hardware/hardware.controller.ts

import { Controller, Post, Body, Get, Param, Delete, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { HardwareService } from './hardware.service';
import { CreateHardwareDto } from './dto/create-hardware.dto';

@Controller('hardware')
export class HardwareController {
  constructor(private readonly hardwareService: HardwareService) {}

  @Post()
  create(@Body() dto: CreateHardwareDto) {
    return this.hardwareService.create(dto);
  }

  // Egy adott rendszer összes hardverének lekérdezése
  @Get('for-system/:systemId')
  findAllForSystem(@Param('systemId') systemId: string) {
    return this.hardwareService.findAllForSystem(+systemId);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.hardwareService.update(+id, updateData);
  }
    @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.hardwareService.remove(+id);
  }
  @Post(':hardwareId/add-software/:softwareId')
  addSoftware(
    @Param('hardwareId') hardwareId: string,
    @Param('softwareId') softwareId: string,
  ) {
    return this.hardwareService.addSoftwareToHardware(+hardwareId, +softwareId);
  }
}