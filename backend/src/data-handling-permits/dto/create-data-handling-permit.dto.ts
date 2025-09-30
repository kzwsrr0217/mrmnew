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

  @IsInt()
  @IsNotEmpty()
  locationId: number; // A helyszín ID-ja, amihez az engedély tartozik

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  classification_level_ids?: number[]; // A minősítési szintek ID-jai
}