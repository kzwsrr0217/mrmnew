import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LogisticsItemType } from '../entities/logistics-item.entity';

export class CreateLogisticsItemDto {
  @IsEnum(LogisticsItemType)
  @IsNotEmpty()
  type: LogisticsItemType;

  @IsString()
  @IsOptional()
  logistics_id?: string;

  @IsString()
  @IsOptional()
  material_code?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  serial_number?: string;

  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  location: string;
}