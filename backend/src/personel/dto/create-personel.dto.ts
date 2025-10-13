import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

class PersonalSecurityDataDto {
  @IsString() @IsOptional() @MaxLength(255) beosztas?: string;
  @IsString() @IsOptional() @MaxLength(100) rendfokozat?: string;
  @IsString() @IsOptional() @MaxLength(100) titoktartasi_szam?: string;
  @IsDateString() @IsOptional() szbt_datum?: Date;
  @IsDateString() @IsOptional() szbt_lejarat?: Date;
  @IsDateString() @IsOptional() nato_datum?: Date;
  @IsDateString() @IsOptional() nato_lejarat?: Date;
  @IsDateString() @IsOptional() eu_datum?: Date;
  @IsDateString() @IsOptional() eu_lejarat?: Date;

  // A régi _id mezőket meghagyjuk, de az import ezeket fogja használni:
  @IsString() @IsOptional() nemzeti_szint?: string; // pl. "Nemzeti Titkos"
  @IsString() @IsOptional() nato_szint?: string;    // pl. "NATO SECRET"
  @IsString() @IsOptional() eu_szint?: string;      // pl. "EU SECRET"

  // Ezeket a backend fogja feltölteni a stringek alapján
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