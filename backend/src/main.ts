// mrmnew/backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // JAVÍTÁS: Részletes CORS beállítások hozzáadása
  app.enableCors({
    origin: 'http://localhost:5173', // A frontend címe, ahonnan a kérések jönnek
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization', // KULCSFONTOSSÁGÚ: Engedélyezzük az Authorization fejlécet
  });

  await app.listen(3000);
}
bootstrap();