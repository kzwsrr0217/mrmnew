// mrmnew/backend/src/logistics/dto/assign-logistics-item.dto.ts

import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HardwareType } from 'src/hardware/hardware.entity';

export class AssignLogisticsItemDto {
  @IsInt()
  @IsNotEmpty()
  itemId: number;

  @IsInt()
  @IsNotEmpty()
  systemId: number;

  @IsEnum(HardwareType)
  @IsNotEmpty()
  type: HardwareType;

  @IsString()
  @IsOptional()
  notes?: string;
}