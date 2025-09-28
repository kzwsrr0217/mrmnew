// mrm-backend/src/systems/dto/create-system.dto.ts

import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// Az enumot importáljuk az entitásból, hogy a kettő mindig szinkronban legyen
enum SystemStatus {
  AKTIV = 'Aktív',
  FEJLESZTES_ALATT = 'Fejlesztés alatt',
  INAKTIV = 'Inaktív',
  ARCHIVALT = 'Archivált',
}

export class CreateSystemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  systemname: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(SystemStatus)
  @IsOptional()
  status?: SystemStatus;
}