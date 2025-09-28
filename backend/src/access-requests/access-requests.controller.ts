// mrmnew/backend/src/access-requests/access-requests.controller.ts

import { Controller, UseGuards, Post, Body, Request, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user.entity';
import { AccessRequestsService } from './access-requests.service';
import { CreateAccessRequestDto } from './dto/create-access-request.dto';
import { RejectAccessRequestDto } from './dto/reject-access-request.dto';

@Controller('access-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccessRequestsController {
    constructor(private readonly accessRequestsService: AccessRequestsService) {}

    @Post()
    @Roles(UserRole.ADMIN, UserRole.RBF)
    create(@Body() createDto: CreateAccessRequestDto, @Request() req: any) {
        return this.accessRequestsService.create(createDto, req.user);
    }

    @Get('pending')
    findPending(@Request() req: any) {
        return this.accessRequestsService.findPendingForUser(req.user);
    }

    @Patch(':id/approve')
    // Győződj meg róla, hogy az ADMIN szerepel itt
    @Roles(UserRole.ADMIN, UserRole.BV, UserRole.HBV, UserRole.HHBV)
    approve(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.accessRequestsService.approveByBv(id, req.user);
    }
    
    @Patch(':id/reject')
    // Győződj meg róla, hogy az ADMIN itt is szerepel
    @Roles(UserRole.ADMIN, UserRole.BV, UserRole.HBV, UserRole.HHBV)
    reject(@Param('id', ParseIntPipe) id: number, @Request() req: any, @Body() dto: RejectAccessRequestDto) {
        return this.accessRequestsService.reject(id, req.user, dto);
    }
}