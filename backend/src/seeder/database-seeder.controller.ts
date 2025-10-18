// mrmnew/backend/src/seeder/database-seeder.controller.ts

import { Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { DatabaseSeederService } from './database-seeder.service'; // JAVÍTVA

@Controller('seeder')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class DatabaseSeederController {
    // JAVÍTVA: a fő seeder service-t injektáljuk be
    constructor(private readonly seederService: DatabaseSeederService) {}

    @Post('run')
    async runSeeder() {
        // JAVÍTVA: a teljes seeder folyamatot futtatjuk
        await this.seederService.runAllSeeders();
        return { message: 'A teljes adatbázis feltöltési folyamat elindítva.' };
    }
}