// mrmnew/backend/src/tickets/tickets.controller.ts

import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto'; // ÚJ IMPORT
import { UpdateStatusDto } from './dto/update-status.dto'; // ÚJ IMPORT

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  // JAVÍTÁS: Itt adjuk meg a 'req' paraméter típusát.
  // A JwtStrategy a 'user' objektumot csatolja a kéréshez.
  create(@Body() createTicketDto: CreateTicketDto, @Request() req: { user: any }) {
    return this.ticketsService.create(createTicketDto, req.user);
  }

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
   findOne(@Param('id') id: string, @Request() req: any) {
      return this.ticketsService.findOne(+id, req.user); // req.user átadása
  }
  
  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: { user: any },
  ) {
    return this.ticketsService.addComment(+id, createCommentDto, req.user);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.ticketsService.updateStatus(+id, updateStatusDto.status);
  }
}