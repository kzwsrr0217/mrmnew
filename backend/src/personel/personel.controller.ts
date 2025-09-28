import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PersonelService } from './personel.service';
import { CreatePersonelDto } from './dto/create-personel.dto';
import { UpdatePersonelDto } from './dto/update-personel.dto';
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
  // A GET végpontokat minden bejelentkezett felhasználó elérheti (nincs @Roles dekorátor)
  findAll() {
    return this.personelService.findAll();
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
}