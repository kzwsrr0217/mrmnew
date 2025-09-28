// mrm-backend/src/hardware/dto/create-hardware.dto.ts

import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { HardwareType, WorkstationType, StorageType, TempestLevel } from '../hardware.entity';

export class CreateHardwareDto {
  @IsEnum(HardwareType)
  @IsNotEmpty()
  type: HardwareType;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  manufacturer?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  model_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  serial_number: string;
  
  @IsString()
  @IsOptional()
  notes?: string;
  
  // --- TEMPEST DTO Rész ---
  @IsBoolean()
  @IsOptional()
  is_tempest?: boolean;

  @ValidateIf(o => o.is_tempest === true)
  @IsEnum(TempestLevel)
  @IsNotEmpty({ message: 'TEMPEST szint megadása kötelező, ha az eszköz TEMPEST-es.' })
  tempest_level: TempestLevel;

  @ValidateIf(o => o.is_tempest === true)
  @IsString()
  @IsNotEmpty({ message: 'TEMPEST tanúsítványszám megadása kötelező, ha az eszköz TEMPEST-es.' })
  tempest_cert_number: string;

  @IsString()
  @IsOptional()
  tempest_number?: string;
  
  // --- Típus-specifikus DTO részek ---
  @IsEnum(WorkstationType)
  @IsOptional()
  workstation_type?: WorkstationType;
  
  @IsString()
  @IsOptional()
  @MaxLength(100)
  inventory_number?: string;
  
  @IsInt()
  @IsOptional()
  storage_size_gb?: number;

  @IsEnum(StorageType)
  @IsOptional()
  storage_type?: StorageType;

  @IsInt()
  @IsNotEmpty()
  system_id: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  classification_ids?: number[];

  @IsInt()
  @IsOptional()
  parent_hardware_id?: number;
}