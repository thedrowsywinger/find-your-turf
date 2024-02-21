import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api/v1');

  await app.listen(PORT);

  console.log("###########################################");
  console.log("###########################################");
  console.log(` ------ Find Your Turf Server is up! ----- `);
  console.log(`----  Running on http://localhost:${PORT} ----`);
  console.log("###########################################");
  console.log("###########################################");
}
bootstrap();
