import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandManagementModule } from './brand-management/brand-management.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true}),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: process.env.DB_MYSQLPORT ? parseInt(process.env.DB_MYSQLPORT) : 3306,
      username: process.env.DB_USER_NAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
      extra: {connectionLimit: 10},
      logging: false
    }),
    BrandManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
