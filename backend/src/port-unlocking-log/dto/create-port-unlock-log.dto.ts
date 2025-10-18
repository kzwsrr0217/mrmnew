// mrmnew/backend/src/port-unlocking-log/dto/create-port-unlock-log.dto.ts

import { IsString, IsNotEmpty, IsDateString, IsNumber } from 'class-validator';

export class CreatePortUnlockLogDto {
  @IsNumber()
  @IsNotEmpty()
  systemId: number; // JAVÍTVA: number típus

  @IsString()
  @IsNotEmpty()
  workstation: string;

  @IsString()
  @IsNotEmpty()
  pendriveId: string;

  @IsString()
  @IsNotEmpty()
  filesToCopy: string;

  @IsDateString()
  @IsNotEmpty()
  unlockTime: string;

  @IsNumber()
  @IsNotEmpty()
  performedById: number; 
}