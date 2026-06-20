import { Injectable } from '@nestjs/common';
import { InMemoryDatabaseService } from '../common/in-memory-database.service';

@Injectable()
export class SimulatorService {
  constructor(private readonly db: InMemoryDatabaseService) {}

  estimate(body: {
    inactiveClients: number;
    averageBasket: number;
    conversionRate: number;
  }) {
    const recoveredClients = Math.round(
      (body.inactiveClients * body.conversionRate) / 100,
    );
    const estimatedRevenue = recoveredClients * body.averageBasket;

    return {
      recoveredClients,
      estimatedRevenue,
    };
  }

  defaults() {
    const inactiveClients = this.db.clients.filter(
      (client) => client.status !== 'Fidèle',
    ).length;
    const averageBasket = Math.round(
      this.db.purchases.reduce((sum, purchase) => sum + purchase.amount, 0) /
        this.db.purchases.length,
    );

    return {
      inactiveClients,
      averageBasket,
      conversionRate: 5,
    };
  }
}
