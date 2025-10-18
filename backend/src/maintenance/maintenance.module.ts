import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceLog } from './maintenance-log.entity';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { System } from 'src/systems/system.entity';
import { User } from 'src/users/user.entity';
import { TicketsModule } from 'src/tickets/tickets.module'; // <-- IMPORTÁLÁS

@Module({
  imports: [
    TypeOrmModule.forFeature([MaintenanceLog, System, User]),
    TicketsModule, // <-- HOZZÁADÁS AZ IMPORTOKHOZ
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
})
export class MaintenanceModule {}