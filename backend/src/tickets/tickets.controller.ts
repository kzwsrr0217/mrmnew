import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Roles } from 'src/auth/roles.decorator'; // <-- JAVÍTÁS: Hiányzó import hozzáadva
import { UserRole } from 'src/users/user.entity';   // <-- JAVÍTÁS: Hiányzó import hozzáadva
import { RolesGuard } from 'src/auth/roles.guard';   // <-- JAVÍTÁS: RolesGuard importálása a használathoz

@Controller('tickets')
@UseGuards(JwtAuthGuard) // A RolesGuard-ot csak ott használjuk, ahol tényleg kell
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto, @Request() req: { user: any }) {
    return this.ticketsService.create(createTicketDto, req.user);
  }

  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) { // JAVÍTÁS: ParseIntPipe használata itt is
      return this.ticketsService.findOne(id, req.user);
  }
 
  @Post(':id/comments')
  addComment(
    @Param('id', ParseIntPipe) id: number, // JAVÍTÁS: ParseIntPipe használata itt is
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: { user: any },
  ) {
    return this.ticketsService.addComment(id, createCommentDto, req.user);
  }

  @Patch(':id/status')
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateStatusDto: UpdateStatusDto,
        @Request() req: any
    ) {
        return this.ticketsService.updateStatus(id, updateStatusDto.status, req.user);
    }
    
    @Patch(':id/claim')
    @UseGuards(RolesGuard) // A RolesGuard-ot csak ezen a specifikus végponton alkalmazzuk
    @Roles(UserRole.RA, UserRole.ADMIN) // Csak RA vagy Admin vehet fel ticketet
    claimTicket(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.ticketsService.claim(id, req.user);
    }
}

