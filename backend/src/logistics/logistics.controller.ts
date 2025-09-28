// mrmnew/backend/src/logistics/logistics.controller.ts

import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { LogisticsService } from './logistics.service';
import { CreateLogisticsItemDto } from './dto/create-logistics-item.dto';
import { AssignLogisticsItemDto } from './dto/assign-logistics-item.dto';

@Controller('logistics')
@UseGuards(JwtAuthGuard)
export class LogisticsController {
    constructor(private readonly logisticsService: LogisticsService) {}

    @Get('items')
    findAllItems() { return this.logisticsService.findAllItems(); }

    @Post('items')
    createItem(@Body() createDto: CreateLogisticsItemDto) {
        return this.logisticsService.createItem(createDto);
    }

    @Get('items/stock')
    findAllStockItems() { return this.logisticsService.findAllStockItems(); }

    @Post('assign') // JAVÍTVA: A végpont egyszerűsödik
    assignItem(@Body() assignDto: AssignLogisticsItemDto) {
        return this.logisticsService.assignItemToSystem(assignDto);
    }
}