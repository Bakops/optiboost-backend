import { Injectable } from '@nestjs/common';
import { InMemoryDatabaseService } from '../common/in-memory-database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly db: InMemoryDatabaseService) {}

  getOverview() {
    const activeClients = this.db.clients.filter((client) => !client.deletedAt);
    const totalPurchases = this.db.purchases.reduce(
      (sum, purchase) => sum + purchase.amount,
      0,
    );
    const averageBasket = Math.round(totalPurchases / this.db.purchases.length);
    const premiumRatio = Math.round(
      (activeClients.filter((client) => client.category === 'Premium').length /
        activeClients.length) *
        100,
    );
    const segmentCount = {
      fidele: activeClients.filter((client) => client.status === 'Fidèle')
        .length,
      aRelancer: activeClients.filter(
        (client) => client.status === 'À relancer',
      ).length,
      perdu: activeClients.filter((client) => client.status === 'Perdu').length,
    };
    const recoveryBase = activeClients.filter(
      (client) => client.status !== 'Fidèle',
    ).length;
    const recoveryPotential = Math.round(recoveryBase * averageBasket * 0.05);

    return {
      averageBasket,
      averageBasketDelta: 4.2,
      premiumRatio,
      segments: segmentCount,
      recoveryPotential,
      quickCampaignCounts: {
        email: activeClients.filter(
          (client) => client.status !== 'Fidèle' && client.email,
        ).length,
        sms: activeClients.filter(
          (client) => client.status !== 'Fidèle' && client.phone,
        ).length,
        whatsapp: activeClients.filter(
          (client) => client.status === 'Perdu' && client.phone,
        ).length,
      },
    };
  }

  getRecentClients() {
    return this.db.clients
      .filter((client) => !client.deletedAt)
      .sort((left, right) =>
        right.lastPurchaseAt.localeCompare(left.lastPurchaseAt),
      )
      .slice(0, 6)
      .map((client) => ({
        id: client.id,
        name: client.fullName,
        status: client.status,
        lastPurchase: this.formatDate(client.lastPurchaseAt),
      }));
  }

  getCampaignsSummary() {
    return this.db.campaigns.map((campaign) => {
      const recipients = this.db.campaignRecipients.filter(
        (entry) => entry.campaignId === campaign.id,
      );
      const opened = recipients.filter((entry) => entry.openedAt).length;
      const delivered = recipients.filter((entry) => entry.deliveredAt).length;
      const sent = recipients.filter((entry) => entry.sentAt).length;

      return {
        id: campaign.id,
        name: campaign.name,
        channel: campaign.channel,
        status: campaign.status,
        sent,
        delivered,
        opened,
        openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      };
    });
  }

  private formatDate(value: string) {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }
}
