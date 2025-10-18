// mrmnew/backend/src/data-handling-permits/dto/create-data-handling-permit.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsInt } from 'class-validator';
import { SecurityClass } from '../data-handling-permit.entity';

export class CreateDataHandlingPermitDto {
  @IsString()
  @IsNotEmpty()
  registration_number: string;

  @IsEnum(SecurityClass)
  @IsNotEmpty()
  security_class: SecurityClass;

  @IsString()
  @IsOptional()
  notes?: string;

  // --- JAVÍTVA: locationId -> locationIds ---
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty({ message: 'Legalább egy helyszínt meg kell adni.' })
  locationIds: number[]; // 'locationId'-ből 'locationIds' lett, és tömböt vár

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  classification_level_ids?: number[];
}