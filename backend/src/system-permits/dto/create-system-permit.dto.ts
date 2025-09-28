// mrm-backend/src/system-permits/dto/create-system-permit.dto.ts
import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer'; // <-- ÚJ IMPORT

export class CreateSystemPermitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  engedely_szam: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  kerelem_szam?: string;

  @Type(() => Date) // <-- EZZEL JELEZZÜK A TRANSFORMÁCIÓT
  @IsDate()         // <-- EZT A VALIDÁTORT HASZNÁLJUK
  @IsNotEmpty()
  kiallitas_datuma: Date;

  @Type(() => Date) // <-- EZZEL JELEZZÜK A TRANSFORMÁCIÓT
  @IsDate()         // <-- EZT A VALIDÁTORT HASZNÁLJUK
  @IsNotEmpty()
  ervenyesseg_datuma: Date;

  @IsInt()
  @IsNotEmpty()
  system_id: number;

  @IsInt()
  @IsOptional()
  nemzeti_classification_id?: number;

  @IsInt()
  @IsOptional()
  nato_classification_id?: number;
  
  @IsInt()
  @IsOptional()
  eu_classification_id?: number;
}