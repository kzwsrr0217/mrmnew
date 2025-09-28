// mrmnew/backend/src/access-requests/dto/create-access-request.dto.ts
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { AccessLevel } from '../../system-access/system-access.entity';

export class CreateAccessRequestDto {
  @IsInt()
  @IsNotEmpty()
  personelId: number;

  @IsInt()
  @IsNotEmpty()
  systemId: number;

  @IsEnum(AccessLevel)
  @IsNotEmpty()
  accessLevel: AccessLevel;
}