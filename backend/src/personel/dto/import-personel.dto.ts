import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreatePersonelDto } from './create-personel.dto';

export class ImportPersonelDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePersonelDto)
  personelData: CreatePersonelDto[];
}