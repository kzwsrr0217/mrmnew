// mrmnew/backend/src/maintenance/maintenance.module.ts

import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceLog } from './maintenance-log.entity';
import { System } from '../systems/system.entity';
import { User } from '../users/user.entity'; // Import the User entity

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceLog, System, User]) // Add User here
  ],
  providers: [MaintenanceService],
  controllers: [MaintenanceController],
})
export class MaintenanceModule {}