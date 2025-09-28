// mrmnew/backend/src/access-requests/dto/reject-access-request.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectAccessRequestDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}