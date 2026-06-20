import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('recent-clients')
  getRecentClients() {
    return this.dashboardService.getRecentClients();
  }

  @Get('campaigns-summary')
  getCampaignsSummary() {
    return this.dashboardService.getCampaignsSummary();
  }
}
