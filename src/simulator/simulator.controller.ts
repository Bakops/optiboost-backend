import { Body, Controller, Get, Post } from '@nestjs/common';
import { SimulatorService } from './simulator.service';

@Controller('simulator')
export class SimulatorController {
  constructor(private readonly simulatorService: SimulatorService) {}

  @Post('estimate')
  estimate(
    @Body()
    body: {
      inactiveClients: number;
      averageBasket: number;
      conversionRate: number;
    },
  ) {
    return this.simulatorService.estimate(body);
  }

  @Get('defaults')
  defaults() {
    return this.simulatorService.defaults();
  }
}
