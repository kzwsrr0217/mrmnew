import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateMaintenanceLogDto {
  @IsInt()
  @IsNotEmpty()
  system_id: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}