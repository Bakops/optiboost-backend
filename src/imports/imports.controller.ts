import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ImportsService } from './imports.service';

@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Get()
  findAll() {
    return this.importsService.findAll();
  }

  @Post()
  create(@Body() body: { fileName?: string; totalRows?: number }) {
    return this.importsService.create(body);
  }

  @Get(':id/errors')
  getErrors(@Param('id') id: string) {
    return this.importsService.getErrors(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.importsService.findOne(id);
  }
}
