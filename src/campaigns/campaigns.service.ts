import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InMemoryDatabaseService } from '../common/in-memory-database.service';
import type { CampaignChannel, CampaignStatus } from '../common/domain.types';

@Injectable()
export class CampaignsService {
  constructor(private readonly db: InMemoryDatabaseService) {}

  findAll(query: { status?: CampaignStatus; channel?: CampaignChannel }) {
    return this.db.campaigns.filter((campaign) => {
      if (query.status && campaign.status !== query.status) {
        return false;
      }
      if (query.channel && campaign.channel !== query.channel) {
        return false;
      }
      return true;
    });
  }

  findOne(id: string) {
    const campaign = this.getCampaign(id);
    return {
      ...campaign,
      analytics: this.analytics(id),
    };
  }

  create(body: {
    name: string;
    channel: CampaignChannel;
    segmentId: string;
    messageTemplate: string;
    scheduledAt?: string | null;
  }) {
    const now = new Date().toISOString();
    const campaign = {
      id: randomUUID(),
      organizationId: this.db.organization.id,
      name: body.name,
      channel: body.channel,
      status: body.scheduledAt ? ('scheduled' as const) : ('draft' as const),
      segmentId: body.segmentId,
      messageTemplate: body.messageTemplate,
      scheduledAt: body.scheduledAt ?? null,
      sentAt: null,
      createdByUserId: this.db.users[0].id,
      createdAt: now,
      updatedAt: now,
    };

    this.db.campaigns.unshift(campaign);
    return campaign;
  }

  update(
    id: string,
    body: {
      name?: string;
      scheduledAt?: string | null;
      messageTemplate?: string;
    },
  ) {
    const campaign = this.getCampaign(id);

    campaign.name = body.name ?? campaign.name;
    campaign.scheduledAt = body.scheduledAt ?? campaign.scheduledAt;
    campaign.messageTemplate = body.messageTemplate ?? campaign.messageTemplate;
    campaign.updatedAt = new Date().toISOString();

    return campaign;
  }

  launch(id: string) {
    const campaign = this.getCampaign(id);
    campaign.status = 'running';
    campaign.sentAt = new Date().toISOString();
    campaign.updatedAt = campaign.sentAt;

    return {
      message: 'Campagne lancée.',
      campaign,
    };
  }

  pause(id: string) {
    const campaign = this.getCampaign(id);
    campaign.status = 'paused';
    campaign.updatedAt = new Date().toISOString();
    return campaign;
  }

  cancel(id: string) {
    const campaign = this.getCampaign(id);
    campaign.status = 'cancelled';
    campaign.updatedAt = new Date().toISOString();
    return campaign;
  }

  recipients(id: string) {
    this.getCampaign(id);
    return this.db.campaignRecipients.filter(
      (entry) => entry.campaignId === id,
    );
  }

  analytics(id: string) {
    this.getCampaign(id);
    const recipients = this.db.campaignRecipients.filter(
      (entry) => entry.campaignId === id,
    );

    return {
      sent: recipients.filter((entry) => entry.sentAt).length,
      delivered: recipients.filter((entry) => entry.deliveredAt).length,
      opened: recipients.filter((entry) => entry.openedAt).length,
      clicked: recipients.filter((entry) => entry.clickedAt).length,
      replied: recipients.filter((entry) => entry.repliedAt).length,
      failed: recipients.filter((entry) => entry.failureReason).length,
      revenueGenerated: recipients.reduce((sum, entry) => {
        const client = this.db.clients.find(
          (candidate) => candidate.id === entry.clientId,
        );
        return (
          sum +
          (client?.status === 'Fidèle'
            ? Math.round((client.totalSpent / 10) * 100) / 100
            : 0)
        );
      }, 0),
    };
  }

  private getCampaign(id: string) {
    const campaign = this.db.campaigns.find((entry) => entry.id === id);

    if (!campaign) {
      throw new NotFoundException('Campagne introuvable.');
    }

    return campaign;
  }
}
