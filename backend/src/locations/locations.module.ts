// mrmnew/backend/src/locations/locations.module.ts

import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // JAVÍTÁS: Importálás
import { Location } from './location.entity'; // JAVÍTÁS: Importálás

@Module({
  // JAVÍTVA: A TypeOrmModule hozzáadása az imports-hoz
  imports: [TypeOrmModule.forFeature([Location])],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}