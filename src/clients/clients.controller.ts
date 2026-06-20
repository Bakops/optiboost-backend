import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import type { ClientCategory, ClientStatus } from '../common/domain.types';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: ClientStatus,
    @Query('category') category?: ClientCategory,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'fullName' | 'lastPurchaseAt' | 'totalSpent',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.clientsService.findAll({
      search,
      status,
      category,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  @Get('stats/segments')
  getSegmentStats() {
    return this.clientsService.getSegmentStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      category?: ClientCategory;
      status?: ClientStatus;
      totalSpent?: number;
    },
  ) {
    return this.clientsService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      category?: ClientCategory;
      status?: ClientStatus;
      totalSpent?: number;
    },
  ) {
    return this.clientsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }

  @Post(':id/relance')
  relance(
    @Param('id') id: string,
    @Body() body: { channel: 'email' | 'sms' | 'whatsapp'; template?: string },
  ) {
    return this.clientsService.relance(id, body);
  }
}
