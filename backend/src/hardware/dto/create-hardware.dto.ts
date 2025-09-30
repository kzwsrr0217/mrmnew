// mrmnew/backend/src/hardware/dto/create-hardware.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsEnum, ValidateIf, IsArray } from 'class-validator';
import { HardwareType, WorkstationType, StorageType, TempestLevel } from '../hardware.entity';

export class CreateHardwareDto {
  @IsEnum(HardwareType)
  @IsNotEmpty()
  type: HardwareType;

  @IsString()
  @IsNotEmpty()
  model_name: string;

  @IsString()
  @IsNotEmpty()
  serial_number: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  notes?: string;
  
  @IsInt()
  @IsNotEmpty()
  system_id: number;

  @IsInt()
  @IsOptional()
  locationId?: number;

  @IsBoolean()
  @IsOptional()
  is_tempest?: boolean;

  @IsEnum(TempestLevel)
  @ValidateIf(o => o.is_tempest === true) // Csak akkor validálja, ha a tempest jelölő be van pipálva
  @IsNotEmpty({ message: 'A TEMPEST szint megadása kötelező, ha az eszköz minősített.' })
  tempest_level?: TempestLevel;

  @IsString()
  @ValidateIf(o => o.is_tempest === true)
  @IsNotEmpty({ message: 'A TEMPEST tanúsítványszám megadása kötelező, ha az eszköz minősített.' })
  tempest_cert_number?: string;

  @IsString()
  @IsOptional()
  tempest_number?: string;
  
  // --- Típus-specifikus validációk ---

  @IsEnum(WorkstationType)
  // JAVÍTÁS: Csak akkor kötelező, ha a típus MUNKAALLOMAS
  @ValidateIf(o => o.type === HardwareType.MUNKAALLOMAS)
  @IsNotEmpty({ message: 'A munkaállomás jellegének megadása kötelező.' })
  workstation_type?: WorkstationType;

  @IsString()
  @IsOptional()
  inventory_number?: string;
  
  @IsInt({ message: 'A méretnek egész számnak kell lennie.' })
  // JAVÍTÁS: Csak akkor validálja, ha a típus ADATTAROLO és a mező ki van töltve
  @ValidateIf(o => o.type === HardwareType.ADATTAROLO)
  @IsOptional()
  storage_size_gb?: number;

  @IsEnum(StorageType)
  @ValidateIf(o => o.type === HardwareType.ADATTAROLO)
  @IsNotEmpty({ message: 'Az adattároló technológiájának megadása kötelező.' })
  storage_type?: StorageType;

  @IsInt({ message: 'A szülő eszköz ID-jának egész számnak kell lennie.' })
  @ValidateIf(o => o.type === HardwareType.ADATTAROLO)
  @IsOptional()
  parent_hardware_id?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  classification_ids?: number[];
}