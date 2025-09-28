// mrm-backend/src/software/dto/create-software.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateSoftwareDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  version?: string;
}