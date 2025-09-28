// mrmnew/backend/src/forms/dto/generate-access-request.dto.ts

import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { AccessLevel } from 'src/system-access/system-access.entity';

// A művelet típusait külön enum-ba szervezzük a könnyebb kezelhetőségért
export enum MuveletTipus {
  Letrehozas = 'Létrehozás',
  Modositas = 'Módosítás',
  Torles = 'Törlés',
}

class UserOperationDto {
  @IsInt() @IsNotEmpty() personelId: number;
  @IsEnum(MuveletTipus) @IsNotEmpty() muvelet: MuveletTipus;
  @IsEnum(AccessLevel) @IsNotEmpty() accessLevel: AccessLevel; // Hozzáadjuk a jogosultsági szintet is
  @IsString() @IsOptional() telefonszam?: string;
  @IsString() @IsOptional() megjegyzes?: string;
}

export class GenerateAccessRequestDto {
  @IsString() @IsNotEmpty() nyilvantartasi_szam: string;
  @IsString() @IsNotEmpty() felelos_szervezet: string;
  @IsInt() @IsNotEmpty() systemId: number;
  @IsString() @IsOptional() telepitesi_hely?: string;
  @IsString() @IsOptional() form_megjegyzes?: string;
  @IsString() @IsNotEmpty() ugyintezo: string;
  @IsString() @IsNotEmpty() kapja_1: string;
  @IsString() @IsNotEmpty() kapja_2: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserOperationDto)
  users: UserOperationDto[];
}