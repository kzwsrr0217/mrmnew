// mrmnew/backend/src/users/dto/create-user.dto.ts

import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'A jelszónak legalább 6 karakter hosszúnak kell lennie.' })
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}