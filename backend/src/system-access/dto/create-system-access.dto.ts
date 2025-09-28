// mrmnew-show/backend/src/system-access/dto/create-system-access.dto.ts

import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { AccessLevel } from '../system-access.entity';

export class CreateSystemAccessDto {
  @IsInt()
  @IsNotEmpty()
  personelId: number; // JAVÍTVA

  @IsInt()
  @IsNotEmpty()
  systemId: number;

  @IsEnum(AccessLevel)
  @IsNotEmpty()
  accessLevel: AccessLevel;
}