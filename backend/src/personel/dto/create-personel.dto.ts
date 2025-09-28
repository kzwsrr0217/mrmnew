// mrmnew-show/backend/src/personel/dto/create-personel.dto.ts

import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

class PersonalSecurityDataDto {
  @IsString() @IsOptional() @MaxLength(255) beosztas?: string;
  @IsString() @IsOptional() @MaxLength(100) rendfokozat?: string;
  @IsString() @IsOptional() @MaxLength(100) titoktartasi_szam?: string;
  @Type(() => Date) @IsDate() @IsOptional() szbt_datum?: Date;
  @Type(() => Date) @IsDate() @IsOptional() szbt_lejarat?: Date;
  @Type(() => Date) @IsDate() @IsOptional() nato_datum?: Date; // ÚJ MEZŐ
  @Type(() => Date) @IsDate() @IsOptional() nato_lejarat?: Date; // ÚJ MEZŐ
  @Type(() => Date) @IsDate() @IsOptional() eu_datum?: Date;
  @Type(() => Date) @IsDate() @IsOptional() eu_lejarat?: Date;
  @IsInt() @IsOptional() nemzeti_szint_id?: number;
  @IsInt() @IsOptional() nato_szint_id?: number;
  @IsInt() @IsOptional() eu_szint_id?: number;
}

export class CreatePersonelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nev: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PersonalSecurityDataDto)
  personal_security_data: PersonalSecurityDataDto;
}