// mrm-backend/src/classifications/dto/create-classification.dto.ts
import { IsEnum, IsNotEmpty, IsString, MaxLength, IsInt } from 'class-validator';
import { ClassificationType } from '../classification.entity';

export class CreateClassificationDto {
  @IsEnum(ClassificationType)
  @IsNotEmpty()
  type: ClassificationType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  level_name: string;

  @IsInt()
  @IsNotEmpty()
  rank: number;
}