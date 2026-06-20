import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InMemoryDatabaseService } from '../common/in-memory-database.service';
import type { Client, Segment } from '../common/domain.types';

type SegmentRules = Segment['rules'];

@Injectable()
export class SegmentsService {
  constructor(private readonly db: InMemoryDatabaseService) {}

  findAll() {
    return this.db.segments.map((segment) => ({
      ...segment,
      estimatedCount: this.getMatchingClients(segment.rules).length,
    }));
  }

  create(body: { name: string; rules: SegmentRules }) {
    const segment = {
      id: randomUUID(),
      organizationId: this.db.organization.id,
      name: body.name,
      rules: body.rules,
      estimatedCount: this.getMatchingClients(body.rules).length,
      createdByUserId: this.db.users[0].id,
      createdAt: new Date().toISOString(),
    };

    this.db.segments.push(segment);
    return segment;
  }

  findOne(id: string) {
    const segment = this.getSegment(id);
    return {
      ...segment,
      estimatedCount: this.getMatchingClients(segment.rules).length,
    };
  }

  findClients(id: string) {
    const segment = this.getSegment(id);
    return this.getMatchingClients(segment.rules);
  }

  update(id: string, body: { name?: string; rules?: SegmentRules }) {
    const segment = this.getSegment(id);

    segment.name = body.name ?? segment.name;
    segment.rules = body.rules ?? segment.rules;
    segment.estimatedCount = this.getMatchingClients(segment.rules).length;

    return segment;
  }

  remove(id: string) {
    const index = this.db.segments.findIndex((entry) => entry.id === id);

    if (index === -1) {
      throw new NotFoundException('Segment introuvable.');
    }

    this.db.segments.splice(index, 1);
    return { success: true, id };
  }

  private getSegment(id: string) {
    const segment = this.db.segments.find((entry) => entry.id === id);

    if (!segment) {
      throw new NotFoundException('Segment introuvable.');
    }

    return segment;
  }

  private getMatchingClients(rules: SegmentRules) {
    return this.db.clients.filter((client) => this.matchesRules(client, rules));
  }

  private matchesRules(client: Client, rules: SegmentRules) {
    if (client.deletedAt) {
      return false;
    }
    if (rules.status && client.status !== rules.status) {
      return false;
    }
    if (rules.category && client.category !== rules.category) {
      return false;
    }
    if (
      typeof rules.minTotalSpent === 'number' &&
      client.totalSpent < rules.minTotalSpent
    ) {
      return false;
    }
    if (rules.hasEmail && !client.email) {
      return false;
    }
    if (typeof rules.lastPurchaseBeforeDays === 'number') {
      const daysSincePurchase = Math.floor(
        (Date.now() - new Date(client.lastPurchaseAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (daysSincePurchase < rules.lastPurchaseBeforeDays) {
        return false;
      }
    }

    return true;
  }
}
