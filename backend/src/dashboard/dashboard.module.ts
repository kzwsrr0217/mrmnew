// mrmnew/backend/src/dashboard/dashboard.module.ts

import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { System } from 'src/systems/system.entity';
import { Ticket } from 'src/tickets/ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, System, Ticket])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}