import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMaintenanceLogDto {
  @IsInt()
  @IsNotEmpty()
  system_id: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  createTicket?: boolean;

  // <-- ÚJ MEZŐ
  @IsInt()
  @IsOptional()
  assignee_id?: number;
}