import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';
import { LoggingModule } from '../logging/logging.module';

@Module({
    imports: [
        ConfigModule,
        LoggingModule
    ],
    providers: [NotificationService],
    exports: [NotificationService]
})
export class NotificationModule {}