import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';
import { MaintenanceService } from './maintenance.service';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  // A naplót egyelőre minden bejelentkezett felhasználó láthatja
  findAll() {
    return this.maintenanceService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.RA) // Bejegyzést csak Admin és Rendszeradminisztrátor hozhat létre
  create(@Body() dto: CreateMaintenanceLogDto, @Request() req: { user: any }) {
    return this.maintenanceService.create(dto, req.user);
  }
}