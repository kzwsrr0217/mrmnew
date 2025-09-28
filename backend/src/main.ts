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
  
  app.enableCors({
    origin: 'http://localhost:5173', // A frontend címe, ahonnan a kérések jönnek
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization', // KULCSFONTOSSÁGÚ: Engedélyezzük az Authorization fejlécet
  });
  await app.listen(3000);
}
bootstrap();