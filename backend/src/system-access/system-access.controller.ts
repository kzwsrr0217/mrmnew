// mrmnew-show/backend/src/system-access/system-access.controller.ts

import { Controller, Post, Body, Get, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { SystemAccessService } from './system-access.service';
import { CreateSystemAccessDto } from './dto/create-system-access.dto';

@Controller('system-access')
export class SystemAccessController {
  constructor(private readonly accessService: SystemAccessService) {}

  @Post('grant')
  grantAccess(@Body() createDto: CreateSystemAccessDto) {
    return this.accessService.grantAccess(createDto);
  }

  // --- ÚJ RÉSZEK ---
  @Get()
  findAll() {
    return this.accessService.findAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeAccess(@Param('id') id: string) {
    return this.accessService.revokeAccess(+id);
  }
}