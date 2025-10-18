import { Controller, Post, Body, Get, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PortUnlockingLogService } from './port-unlocking-log.service';
import { CreatePortUnlockLogDto } from './dto/create-port-unlock-log.dto';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { RolesGuard } from 'src/auth/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('port-unlocking-log')
export class PortUnlockingLogController {
  constructor(private readonly logService: PortUnlockingLogService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RBF, UserRole.RA)
  create(@Body() createDto: CreatePortUnlockLogDto, @Req() req) {
    return this.logService.create(createDto, req.user);
  }

  @Get()
  findAll() {
    return this.logService.findAll();
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.BV, UserRole.HBV, UserRole.HHBV)
  approve(@Param('id') id: string, @Req() req) {
    return this.logService.approve(id, req.user);
  }

  @Patch(':id/close')
  @Roles(UserRole.ADMIN, UserRole.RA)
  close(@Param('id') id: string, @Req() req) {
    return this.logService.close(id, req.user);
  }
}