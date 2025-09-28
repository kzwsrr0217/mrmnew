// mrm-backend/src/system-permits/system-permits.controller.ts
import { Controller, Post, Body, Get, Param, Delete, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { SystemPermitsService } from './system-permits.service';
import { CreateSystemPermitDto } from './dto/create-system-permit.dto';
import { UpdateSystemPermitDto } from './dto/update-system-permit.dto'; // <-- Hiányzó import

@Controller('system-permits')
export class SystemPermitsController {
  constructor(private readonly systemPermitsService: SystemPermitsService) {}

  @Post()
  create(@Body() dto: CreateSystemPermitDto) {
    return this.systemPermitsService.create(dto);
  }
  @Get('by-system/:systemId')
  findOneBySystemId(@Param('systemId') systemId: string) {
    return this.systemPermitsService.findOneBySystemId(+systemId);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Sikeres törlés esetén 204-es kódot küldünk vissza
  remove(@Param('id') id: string) {
    return this.systemPermitsService.remove(+id);
  }
    @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSystemPermitDto) {
    return this.systemPermitsService.update(+id, dto);
  }
}