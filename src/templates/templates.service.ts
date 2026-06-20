import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InMemoryDatabaseService } from '../common/in-memory-database.service';
import type { CampaignChannel } from '../common/domain.types';

@Injectable()
export class TemplatesService {
  constructor(private readonly db: InMemoryDatabaseService) {}

  findAll() {
    return this.db.templates;
  }

  create(body: { name: string; channel: CampaignChannel; content: string }) {
    const now = new Date().toISOString();
    const template = {
      id: randomUUID(),
      organizationId: this.db.organization.id,
      name: body.name,
      channel: body.channel,
      content: body.content,
      createdAt: now,
      updatedAt: now,
    };

    this.db.templates.unshift(template);
    return template;
  }

  update(id: string, body: { name?: string; content?: string }) {
    const template = this.getTemplate(id);
    template.name = body.name ?? template.name;
    template.content = body.content ?? template.content;
    template.updatedAt = new Date().toISOString();
    return template;
  }

  remove(id: string) {
    const index = this.db.templates.findIndex((entry) => entry.id === id);

    if (index === -1) {
      throw new NotFoundException('Template introuvable.');
    }

    this.db.templates.splice(index, 1);
    return { success: true, id };
  }

  preview(body: { template: string; variables?: Record<string, string> }) {
    const variables = body.variables ?? { firstName: 'Sophie' };
    const rendered = Object.entries(variables).reduce(
      (content, [key, value]) => {
        return content.replaceAll(`{{${key}}}`, value);
      },
      body.template,
    );

    return {
      rendered,
      variables,
    };
  }

  private getTemplate(id: string) {
    const template = this.db.templates.find((entry) => entry.id === id);

    if (!template) {
      throw new NotFoundException('Template introuvable.');
    }

    return template;
  }
}
