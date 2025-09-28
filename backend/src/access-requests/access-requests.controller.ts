// mrmnew/backend/src/access-requests/access-requests.controller.ts

import { Controller, UseGuards, Post, Body, Request, Get, Param, ParseIntPipe, Patch, ForbiddenException } from '@nestjs/common';
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
    @Roles(UserRole.ADMIN, UserRole.BV, UserRole.HBV, UserRole.HHBV) // Csak a BV és helyettesei hagynak jóvá
    approve(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.accessRequestsService.approveByBv(id, req.user);
    }
    
    @Patch(':id/reject')
    @Roles(UserRole.ADMIN, UserRole.BV, UserRole.HBV, UserRole.HHBV) // Csak ők utasíthatnak el
    reject(@Param('id', ParseIntPipe) id: number, @Request() req: any, @Body() dto: RejectAccessRequestDto) {
        return this.accessRequestsService.reject(id, req.user, dto);
    }
    
    // A 'complete' végpontot töröltük, mert az RA a ticketet fogja kezelni
}