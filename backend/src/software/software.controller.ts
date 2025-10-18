// mrmnew/backend/src/software/software.controller.ts
import { Controller, Post, Body, Get, Patch, Param, Delete } from '@nestjs/common'; // <-- ÚJ IMPORTOK
import { SoftwareService } from './software.service';
import { CreateSoftwareDto } from './dto/create-software.dto';
import { UpdateSoftwareDto } from './dto/update-software.dto'; // <-- ÚJ IMPORT

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

  // --- ÚJ VÉGPONTOK ---

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSoftwareDto) {
    return this.softwareService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.softwareService.remove(+id);
  }
}