// mrm-backend/src/documents/dto/create-document.dto.ts
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DocumentType } from '../document.entity';

export class CreateDocumentDto {
  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @IsString()
  @IsOptional()
  registration_number?: string;

  @IsDateString()
  @IsOptional()
  issue_date?: Date;
  
  @IsString()
  @IsOptional()
  handler_name?: string;

  @IsInt()
  @IsNotEmpty()
  system_id: number;
}