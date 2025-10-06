// mrmnew-show/backend/src/personel/dto/create-personel.dto.ts

import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

class PersonalSecurityDataDto {
  @IsString() @IsOptional() @MaxLength(255) beosztas?: string;
  @IsString() @IsOptional() @MaxLength(100) rendfokozat?: string;
  @IsString() @IsOptional() @MaxLength(100) titoktartasi_szam?: string;
  
  // A Type() dekorátor már nem kell, és IsDate -> IsDateString
  @IsDateString() @IsOptional() szbt_datum?: Date;
  @IsDateString() @IsOptional() szbt_lejarat?: Date;
  @IsDateString() @IsOptional() nato_datum?: Date;
  @IsDateString() @IsOptional() nato_lejarat?: Date;
  @IsDateString() @IsOptional() eu_datum?: Date;
  @IsDateString() @IsOptional() eu_lejarat?: Date;

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