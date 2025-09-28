import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TicketPriority } from '../ticket.entity';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  // Az assignee_id opcionális, mert nem minden ticket van azonnal hozzárendelve valakihez
  @IsInt()
  @IsOptional()
  assignee_id?: number;
}