import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SegmentsService } from './segments.service';
import type { Segment } from '../common/domain.types';

@Controller('segments')
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Get()
  findAll() {
    return this.segmentsService.findAll();
  }

  @Post()
  create(@Body() body: { name: string; rules: Segment['rules'] }) {
    return this.segmentsService.create(body);
  }

  @Get(':id/clients')
  findClients(@Param('id') id: string) {
    return this.segmentsService.findClients(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.segmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; rules?: Segment['rules'] },
  ) {
    return this.segmentsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.segmentsService.remove(id);
  }
}
