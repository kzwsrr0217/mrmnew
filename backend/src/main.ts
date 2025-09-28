// mrm-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true, // Automatikusan átalakítja a bejövő adatokat a DTO típusainak megfelelően
    whitelist: true, // Eltávolítja azokat a tulajdonságokat, amik nem szerepelnek a DTO-ban
  }));
  
  app.enableCors();

  await app.listen(3000);
}
bootstrap();