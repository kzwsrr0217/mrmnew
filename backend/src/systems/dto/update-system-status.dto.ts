import { IsEnum } from 'class-validator';
import { SystemStatus } from '../system.entity';

export class UpdateSystemStatusDto {
  @IsEnum(SystemStatus)
  status: SystemStatus;
}