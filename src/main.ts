import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Find Your Turf API')
    .setDescription('The Find Your Turf API documentation for sports facility booking platform')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('fields', 'Field management endpoints')
    .addTag('bookings', 'Booking management endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('brands', 'Brand management endpoints')
    .addTag('reviews', 'Field review endpoints')
    .addTag('admin', 'Admin-only endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addCookieAuth(
      'refreshToken',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
      },
      'refresh-token'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Security middleware
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe with strict settings
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  app.setGlobalPrefix('api/v1');

  await app.listen(PORT);

  console.log("##################################################");
  console.log("##################################################");
  console.log(` --------- Find Your Turf Server is up! --------- `);
  console.log(`------- Running on http://localhost:${PORT} ------`);
  console.log(` Swagger docs: http://localhost:${PORT}/api/docs  `);
  console.log("##################################################");
  console.log("##################################################");
}
bootstrap();
