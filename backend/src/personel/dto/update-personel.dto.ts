// mrmnew-show/backend/src/personel/dto/update-personel.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonelDto } from './create-personel.dto';

export class UpdatePersonelDto extends PartialType(CreatePersonelDto) {} // Átnevezve