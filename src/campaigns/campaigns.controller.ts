import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import type { CampaignChannel, CampaignStatus } from '../common/domain.types';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  findAll(
    @Query('status') status?: CampaignStatus,
    @Query('channel') channel?: CampaignChannel,
  ) {
    return this.campaignsService.findAll({ status, channel });
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      channel: CampaignChannel;
      segmentId: string;
      messageTemplate: string;
      scheduledAt?: string | null;
    },
  ) {
    return this.campaignsService.create(body);
  }

  @Get(':id/recipients')
  recipients(@Param('id') id: string) {
    return this.campaignsService.recipients(id);
  }

  @Get(':id/analytics')
  analytics(@Param('id') id: string) {
    return this.campaignsService.analytics(id);
  }

  @Post(':id/launch')
  launch(@Param('id') id: string) {
    return this.campaignsService.launch(id);
  }

  @Post(':id/pause')
  pause(@Param('id') id: string) {
    return this.campaignsService.pause(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.campaignsService.cancel(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      scheduledAt?: string | null;
      messageTemplate?: string;
    },
  ) {
    return this.campaignsService.update(id, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }
}
