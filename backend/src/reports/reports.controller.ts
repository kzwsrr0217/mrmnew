// mrmnew/backend/src/reports/reports.controller.ts

import { Controller, Get, Query, ParseIntPipe, Param } from '@nestjs/common'; // Param importálása
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) {}

    @Get('expiring-certificates')
    getExpiringCertificates(@Query('months', ParseIntPipe) months: number) {
        return this.reportsService.findExpiringCertificates(months);
    }
    @Get('expiring-permits')
    getExpiringPermits(@Query('months', ParseIntPipe) months: number) {
        return this.reportsService.findExpiringPermits(months);
    }
        /**
     * ÚJ VÉGPONT: Hozzáférési jelentés.
     * A @Query paraméterek opcionálisak.
     */
    @Get('access')
    getAccessReport(
        @Query('personelId', new ParseIntPipe({ optional: true })) personelId?: number,
        @Query('systemId', new ParseIntPipe({ optional: true })) systemId?: number,
    ) {
        return this.reportsService.findAccessReport(personelId, systemId);
    }
        @Get('system-elements/:systemId')
    getSystemElementsReport(@Param('systemId', ParseIntPipe) systemId: number) {
      return this.reportsService.getSystemElementsReport(systemId);
    }
}