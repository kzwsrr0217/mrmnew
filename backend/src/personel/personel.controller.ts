import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common'; // <-- Query importálása
import { PersonelService } from './personel.service';
import { CreatePersonelDto } from './dto/create-personel.dto';
import { UpdatePersonelDto } from './dto/update-personel.dto';
import { ImportPersonelDto } from './dto/import-personel.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; // Fontos importok
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user.entity';

@Controller('personel')
@UseGuards(JwtAuthGuard, RolesGuard) // Alkalmazzuk a guardokat az egész controllerre
export class PersonelController {
  constructor(private readonly personelService: PersonelService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SZBF) // Csak Admin és SZBF hozhat létre
  create(@Body() createPersonelDto: CreatePersonelDto) {
    return this.personelService.create(createPersonelDto);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.personelService.findAll(search);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personelService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SZBF) // Csak Admin és SZBF módosíthat
  update(@Param('id') id: string, @Body() updatePersonelDto: UpdatePersonelDto) {
    return this.personelService.update(+id, updatePersonelDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SZBF) // Csak Admin és SZBF törölhet
  remove(@Param('id') id: string) {
    return this.personelService.remove(+id);
  }

@Post('import')
@Roles(UserRole.ADMIN) // Csak adminisztrátorok érhessék el
async bulkImport(@Body() importDto: ImportPersonelDto) {
  return this.personelService.bulkImport(importDto.personelData);
}
}