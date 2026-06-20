import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InMemoryDatabaseService } from '../common/in-memory-database.service';

@Injectable()
export class PurchasesService {
  constructor(private readonly db: InMemoryDatabaseService) {}

  findAll() {
    return this.db.purchases;
  }

  create(body: {
    clientId: string;
    amount: number;
    productType: string;
    productCategory: string;
    purchasedAt?: string;
  }) {
    const purchase = {
      id: randomUUID(),
      organizationId: this.db.organization.id,
      clientId: body.clientId,
      amount: body.amount,
      productType: body.productType,
      productCategory: body.productCategory,
      purchasedAt: body.purchasedAt ?? new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.db.purchases.unshift(purchase);
    return purchase;
  }

  findByClient(clientId: string) {
    return this.db.purchases.filter(
      (purchase) => purchase.clientId === clientId,
    );
  }
}
