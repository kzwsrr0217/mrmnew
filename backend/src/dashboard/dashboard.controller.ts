import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // A régi '/stats' és '/tickets-by-status' végpontokat eltávolítottuk,
  // és ezt az egy, mindent tudó végpontot használjuk helyettük.
  @Get('widgets')
  getDashboardWidgets() {
    return this.dashboardService.getDashboardWidgets();
  }
}