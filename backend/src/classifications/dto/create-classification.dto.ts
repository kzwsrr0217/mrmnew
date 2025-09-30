// mrmnew/backend/src/classifications/dto/create-classification.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsInt } from 'class-validator';
import { ClassificationType } from '../classification.entity';

export class CreateClassificationDto {
  @IsEnum(ClassificationType)
  @IsNotEmpty()
  type: ClassificationType;

  @IsString()
  @IsNotEmpty()
  level_name: string;

  @IsInt()
  @IsNotEmpty()
  rank: number;
}