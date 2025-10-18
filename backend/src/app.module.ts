// mrmnew/backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemsModule } from './systems/systems.module';
import { ClassificationsModule } from './classifications/classifications.module';
import { SystemPermitsModule } from './system-permits/system-permits.module';
import { HardwareModule } from './hardware/hardware.module';
import { DocumentsModule } from './documents/documents.module';
import { SoftwareModule } from './software/software.module';
import { PersonalSecurityDataModule } from './personal-security-data/personal-security-data.module';
import { PersonelModule } from './personel/personel.module';
import { SystemAccessModule } from './system-access/system-access.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DatabaseSeederModule } from './seeder/database-seeder.module';
import { TicketsModule } from './tickets/tickets.module';
import { AuditModule } from './audit/audit.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsModule } from './reports/reports.module';
import { AccessRequestsModule } from './access-requests/access-requests.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LogisticsModule } from './logistics/logistics.module';
import { FormsModule } from './forms/forms.module';
import { LocationsModule } from './locations/locations.module';
import { DataHandlingPermitsModule } from './data-handling-permits/data-handling-permits.module';
import { PortUnlockingLogModule } from './port-unlocking-log/port-unlocking-log.module'; // <-- ÚJ IMPORT
import { BackupModule } from './backup/backup.module'; // <-- ÚJ IMPORT

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db',
      port: 3306,
      username: 'root',       // Helyes felhasználó a docker-compose.yml-ből
      password: 'rootpassword',   // Helyes jelszó a docker-compose.yml-ből
      database: 'mrmdb',
      autoLoadEntities: true,
      synchronize: true,
    }),
    SystemsModule,
    ClassificationsModule,
    SystemPermitsModule,
    HardwareModule,
    DocumentsModule,
    SoftwareModule,
    PersonalSecurityDataModule,
    PersonelModule,
    SystemAccessModule,
    AuthModule,
    UsersModule,
    DatabaseSeederModule,
    TicketsModule,
    AuditModule,
    MaintenanceModule,
    ReportsModule,
    ScheduleModule.forRoot(),
    AccessRequestsModule,
    DashboardModule,
    NotificationsModule,
    LogisticsModule,
    FormsModule,
    LocationsModule,
    DataHandlingPermitsModule,
    PortUnlockingLogModule,
    BackupModule, // <-- EZT A SORT ADD HOZZÁ

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}