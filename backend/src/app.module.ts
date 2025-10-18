// mrmnew/backend/src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'; // <-- MÓDOSÍTVA
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter'; // <-- ÚJ IMPORT
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TicketsModule } from './tickets/tickets.module';
import { SystemsModule } from './systems/systems.module';
import { HardwareModule } from './hardware/hardware.module';
import { SoftwareModule } from './software/software.module';
import { DocumentsModule } from './documents/documents.module';
import { SystemPermitsModule } from './system-permits/system-permits.module';
import { PersonelModule } from './personel/personel.module';
import { PersonalSecurityDataModule } from './personal-security-data/personal-security-data.module';
import { SystemAccessModule } from './system-access/system-access.module';
import { AccessRequestsModule } from './access-requests/access-requests.module';
import { ReportsModule } from './reports/reports.module';
import { FormsModule } from './forms/forms.module';
import { AuditModule } from './audit/audit.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DatabaseSeederModule } from './seeder/database-seeder.module';
import { LogisticsModule } from './logistics/logistics.module';
import { LocationsModule } from './locations/locations.module';
import { ClassificationsModule } from './classifications/classifications.module';
import { DataHandlingPermitsModule } from './data-handling-permits/data-handling-permits.module';
import { PortUnlockingLogModule } from './port-unlocking-log/port-unlocking-log.module';
import { BackupModule } from './backup/backup.module';
import { RequestContextModule } from './request-context/request-context.module'; // <-- ÚJ IMPORT
import { RequestContextMiddleware } from './request-context/request-context.middleware'; // <-- ÚJ IMPORT

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // --- JAVÍTVA: A VÁLTOZÓNEVEK MOST MÁR MEGEGYEZNEK A DOCKER-COMPOSE.YML-LEL ---
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('MYSQL_HOST'),     // DB_HOST -> MYSQL_HOST
        port: configService.get<number>('DB_PORT', 3306), // DB_PORT -> DB_PORT (vagy alapértelmezett 3306)
        username: configService.get<string>('MYSQL_USER'), // DB_USERNAME -> MYSQL_USER
        password: configService.get<string>('MYSQL_PASSWORD'), // DB_PASSWORD -> MYSQL_PASSWORD
        database: configService.get<string>('MYSQL_DATABASE'), // DB_DATABASE_NAME -> MYSQL_DATABASE
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    RequestContextModule, // <-- ÚJ MODUL
    UsersModule,
    AuthModule,
    TicketsModule,
    SystemsModule,
    HardwareModule,
    SoftwareModule,
    DocumentsModule,
    SystemPermitsModule,
    PersonelModule,
    PersonalSecurityDataModule,
    SystemAccessModule,
    AccessRequestsModule,
    ReportsModule,
    FormsModule,
    AuditModule,
    MaintenanceModule,
    DashboardModule,
    NotificationsModule,
    DatabaseSeederModule,
    LogisticsModule,
    LocationsModule,
    ClassificationsModule,
    DataHandlingPermitsModule,
    PortUnlockingLogModule,
    BackupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// JAVÍTVA: Implementáljuk a NestModule-t a middleware-hez
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware) // <-- ÚJ MIDDLEWARE
      .forRoutes('*'); // Alkalmazzuk minden útvonalra
  }
}