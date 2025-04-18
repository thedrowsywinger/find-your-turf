import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggingService {
    private logger: winston.Logger;

    constructor(private configService: ConfigService) {
        this.logger = winston.createLogger({
            level: configService.get('NODE_ENV') === 'production' ? 'info' : 'debug',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            transports: [
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/combined.log' }),
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple(),
                    ),
                }),
            ],
        });
    }

    log(message: string, context?: any) {
        this.logger.info(message, { context });
    }

    error(message: string, trace?: string, context?: any) {
        this.logger.error(message, { trace, context });
    }

    warn(message: string, context?: any) {
        this.logger.warn(message, { context });
    }

    debug(message: string, context?: any) {
        this.logger.debug(message, { context });
    }

    // Specific method for audit logging
    audit(action: string, userId: number, details: any) {
        this.logger.info('AUDIT', {
            action,
            userId,
            details,
            timestamp: new Date().toISOString(),
        });
    }

    // Method for security-related events
    security(event: string, details: any) {
        this.logger.warn('SECURITY', {
            event,
            details,
            timestamp: new Date().toISOString(),
        });
    }
}