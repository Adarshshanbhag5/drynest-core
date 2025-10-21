import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorators/public.decorator';
@Controller('app')
@Public()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    return this.appService.checkServiceHealth();
  }
}
