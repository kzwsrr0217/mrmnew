// mrm-backend/src/system-permits/dto/update-system-permit.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSystemPermitDto } from './create-system-permit.dto';

export class UpdateSystemPermitDto extends PartialType(CreateSystemPermitDto) {}