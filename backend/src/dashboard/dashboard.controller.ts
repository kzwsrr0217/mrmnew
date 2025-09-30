// mrmnew/backend/src/dashboard/dashboard.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user.entity';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Biztosítjuk, hogy csak adminok érhessék el
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('stats')
    getStats() {
        return this.dashboardService.getStats();
    }

    // --- ÚJ VÉGPONT ---
    @Get('tickets-by-status')
    getTicketsByStatus() {
        return this.dashboardService.getTicketsByStatus();
    }
}