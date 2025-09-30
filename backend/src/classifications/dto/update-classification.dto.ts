// mrmnew/backend/src/classifications/dto/update-classification.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateClassificationDto } from './create-classification.dto';

export class UpdateClassificationDto extends PartialType(CreateClassificationDto) {}