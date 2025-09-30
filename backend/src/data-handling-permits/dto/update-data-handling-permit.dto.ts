// mrmnew/backend/src/data-handling-permits/dto/update-data-handling-permit.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateDataHandlingPermitDto } from './create-data-handling-permit.dto';

export class UpdateDataHandlingPermitDto extends PartialType(CreateDataHandlingPermitDto) {}