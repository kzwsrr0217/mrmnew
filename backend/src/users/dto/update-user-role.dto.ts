import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../user.entity';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}