// mrmnew/backend/src/users/users.controller.ts

import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from './user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto.username, createUserDto.password, createUserDto.role);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.RBF, UserRole.SZBF, UserRole.ALEGYSEGPARANCSNOK) // JAVÍTVA: APK -> ALEGYSEGPARANCSNOK
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() updateUserRoleDto: UpdateUserRoleDto) {
    return this.usersService.updateUserRole(id, updateUserRoleDto.role);
  }

  @Patch(':id/reset-password')
  @Roles(UserRole.ADMIN)
  resetPassword(@Param('id', ParseIntPipe) id: number, @Body() resetPasswordDto: ResetPasswordDto) {
    return this.usersService.resetPassword(id, resetPasswordDto.newPassword);
  }
}