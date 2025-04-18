import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthCheckStatus(): string {
    return 'Health Check OK - All systems operational';
  }
}
