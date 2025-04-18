import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('system')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Health check [GET /]',
    description: 'Check if the API server is up and running' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API is healthy',
    schema: {
      type: 'string',
      example: 'OK'
    }
  })
  getHealthCheckStatus(): string {
    return this.appService.getHealthCheckStatus();
  }
}
