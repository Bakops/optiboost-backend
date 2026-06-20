import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PurchasesService } from './purchases.service';

@Controller()
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get('purchases')
  findAll() {
    return this.purchasesService.findAll();
  }

  @Post('purchases')
  create(
    @Body()
    body: {
      clientId: string;
      amount: number;
      productType: string;
      productCategory: string;
      purchasedAt?: string;
    },
  ) {
    return this.purchasesService.create(body);
  }

  @Get('clients/:id/purchases')
  findByClient(@Param('id') id: string) {
    return this.purchasesService.findByClient(id);
  }
}
