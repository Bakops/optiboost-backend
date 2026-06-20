import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InMemoryDatabaseService } from '../common/in-memory-database.service';
import type {
  Client,
  ClientCategory,
  ClientStatus,
} from '../common/domain.types';

type ListQuery = {
  search?: string;
  status?: ClientStatus;
  category?: ClientCategory;
  page?: string;
  limit?: string;
  sortBy?: 'fullName' | 'lastPurchaseAt' | 'totalSpent';
  sortOrder?: 'asc' | 'desc';
};

type ClientBody = Partial<
  Pick<
    Client,
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'phone'
    | 'category'
    | 'status'
    | 'totalSpent'
  >
>;

@Injectable()
export class ClientsService {
  constructor(private readonly db: InMemoryDatabaseService) {}

  findAll(query: ListQuery) {
    const search = query.search?.toLowerCase().trim();
    const page = Number(query.page ?? '1');
    const limit = Number(query.limit ?? '20');
    const sortBy = query.sortBy ?? 'fullName';
    const sortOrder = query.sortOrder ?? 'asc';

    const filtered = this.db.clients
      .filter((client) => !client.deletedAt)
      .filter((client) =>
        query.status ? client.status === query.status : true,
      )
      .filter((client) =>
        query.category ? client.category === query.category : true,
      )
      .filter((client) => {
        if (!search) {
          return true;
        }

        return (
          client.fullName.toLowerCase().includes(search) ||
          client.email.toLowerCase().includes(search)
        );
      })
      .sort((left, right) => {
        const direction = sortOrder === 'asc' ? 1 : -1;

        if (sortBy === 'totalSpent') {
          return (left.totalSpent - right.totalSpent) * direction;
        }

        return (
          String(left[sortBy]).localeCompare(String(right[sortBy])) * direction
        );
      });

    const start = (page - 1) * limit;
    const data = filtered
      .slice(start, start + limit)
      .map((client) => this.toClientView(client));

    return {
      data,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      },
    };
  }

  findOne(id: string) {
    const client = this.getClientById(id);

    return {
      ...this.toClientView(client),
      purchases: this.db.purchases.filter(
        (purchase) => purchase.clientId === id,
      ),
    };
  }

  create(body: ClientBody) {
    const now = new Date().toISOString();
    const firstName = body.firstName ?? 'Nouveau';
    const lastName = body.lastName ?? 'Client';
    const client: Client = {
      id: randomUUID(),
      organizationId: this.db.organization.id,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email:
        body.email ??
        `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.fr`,
      phone: body.phone ?? '+33600000000',
      status: body.status ?? 'À relancer',
      category: body.category ?? 'Standard',
      premiumStatus: (body.category ?? 'Standard') === 'Premium',
      lastPurchaseAt: now,
      totalSpent: body.totalSpent ?? 0,
      source: 'manual',
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.db.clients.push(client);
    return this.toClientView(client);
  }

  update(id: string, body: ClientBody) {
    const client = this.getClientById(id);

    if (body.firstName) {
      client.firstName = body.firstName;
    }
    if (body.lastName) {
      client.lastName = body.lastName;
    }

    client.fullName = `${client.firstName} ${client.lastName}`;
    client.email = body.email ?? client.email;
    client.phone = body.phone ?? client.phone;
    client.category = body.category ?? client.category;
    client.status = body.status ?? client.status;
    client.totalSpent = body.totalSpent ?? client.totalSpent;
    client.premiumStatus = client.category === 'Premium';
    client.updatedAt = new Date().toISOString();

    return this.toClientView(client);
  }

  remove(id: string) {
    const client = this.getClientById(id);
    client.deletedAt = new Date().toISOString();
    client.updatedAt = client.deletedAt;

    return { success: true, id };
  }

  relance(
    id: string,
    body: { channel: 'email' | 'sms' | 'whatsapp'; template?: string },
  ) {
    const client = this.getClientById(id);

    return {
      message: 'Relance préparée.',
      clientId: client.id,
      clientName: client.fullName,
      channel: body.channel,
      template:
        body.template ??
        'Bonjour {{firstName}}, nous avons une offre pour vous.',
      scheduledAt: new Date().toISOString(),
    };
  }

  getSegmentStats() {
    const clients = this.db.clients.filter((client) => !client.deletedAt);

    return {
      total: clients.length,
      fidele: clients.filter((client) => client.status === 'Fidèle').length,
      aRelancer: clients.filter((client) => client.status === 'À relancer')
        .length,
      perdu: clients.filter((client) => client.status === 'Perdu').length,
    };
  }

  private getClientById(id: string) {
    const client = this.db.clients.find(
      (entry) => entry.id === id && !entry.deletedAt,
    );

    if (!client) {
      throw new NotFoundException('Client introuvable.');
    }

    return client;
  }

  private toClientView(client: Client) {
    return {
      id: client.id,
      name: client.fullName,
      email: client.email,
      phone: client.phone,
      status: client.status,
      category: client.category,
      lastPurchase: this.formatDate(client.lastPurchaseAt),
      lastPurchaseAt: client.lastPurchaseAt,
      total: client.totalSpent,
      source: client.source,
    };
  }

  private formatDate(value: string) {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }
}
