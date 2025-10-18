// mrmnew/backend/src/audit/audit.controller.ts

import { Controller, Get, UseGuards, Query, ValidationPipe } from '@nestjs/common'; // <-- Query és ValidationPipe import
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto'; // <-- ÚJ DTO IMPORT

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Az egész kontrollert csak Admin érheti el
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query(new ValidationPipe({ transform: true, forbidNonWhitelisted: true })) query: AuditQueryDto) {
    return this.auditService.findAll(query);
  }

  // --- ÚJ VÉGPONT A SZŰRŐ DROPDOWN OPCIÓKHOZ ---
  @Get('filter-options')
  getFilterOptions() {
    return this.auditService.getFilterOptions();
  }
}