import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './common/shared.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ClientsModule } from './clients/clients.module';
import { ImportsModule } from './imports/imports.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { SimulatorModule } from './simulator/simulator.module';
import { PurchasesModule } from './purchases/purchases.module';
import { SegmentsModule } from './segments/segments.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    DashboardModule,
    ClientsModule,
    ImportsModule,
    CampaignsModule,
    SimulatorModule,
    PurchasesModule,
    SegmentsModule,
    TemplatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
