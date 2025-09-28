import { Module } from '@nestjs/common';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personel } from '../personel/personel.entity';
import { System } from '../systems/system.entity';
import { SystemPermit } from '../system-permits/system-permit.entity';
import { Ticket } from 'src/tickets/ticket.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [ TypeOrmModule.forFeature([Personel, System, SystemPermit, Ticket, User]) ], // Ticket és User hozzáadva
  controllers: [FormsController],
  providers: [FormsService]
})
export class FormsModule {}