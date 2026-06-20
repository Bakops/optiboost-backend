import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import type { CampaignChannel } from '../common/domain.types';

@Controller()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get('templates')
  findAll() {
    return this.templatesService.findAll();
  }

  @Post('templates')
  create(
    @Body() body: { name: string; channel: CampaignChannel; content: string },
  ) {
    return this.templatesService.create(body);
  }

  @Patch('templates/:id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; content?: string },
  ) {
    return this.templatesService.update(id, body);
  }

  @Delete('templates/:id')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(id);
  }

  @Post('messages/preview')
  preview(
    @Body() body: { template: string; variables?: Record<string, string> },
  ) {
    return this.templatesService.preview(body);
  }
}
