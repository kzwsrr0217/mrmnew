import { IsEnum, IsNotEmpty } from 'class-validator';
import { TicketStatus } from '../ticket.entity';

export class UpdateStatusDto {
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;
}