// mrmnew/backend/src/seeder/database-seeder.controller.ts

import { Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { TestDataSeeder } from './test-data.seeder';

@Controller('seeder')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class DatabaseSeederController {
    constructor(private readonly testDataSeeder: TestDataSeeder) {}

    @Post('run')
    async runSeeder() {
        await this.testDataSeeder.seed();
        return { message: 'Test data seeding process initiated.' };
    }
}