import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InMemoryDatabaseService } from '../common/in-memory-database.service';

@Injectable()
export class ImportsService {
  constructor(private readonly db: InMemoryDatabaseService) {}

  create(body: { fileName?: string; totalRows?: number }) {
    const now = new Date().toISOString();
    const item = {
      id: randomUUID(),
      organizationId: this.db.organization.id,
      uploadedByUserId: this.db.users[0].id,
      fileName: body.fileName ?? 'clients_upload.xlsx',
      storagePath: `/imports/${body.fileName ?? 'clients_upload.xlsx'}`,
      status: 'processing' as const,
      totalRows: body.totalRows ?? 0,
      importedRows: Math.max(0, (body.totalRows ?? 0) - 2),
      rejectedRows: body.totalRows ? 2 : 0,
      startedAt: now,
      completedAt: null,
      createdAt: now,
    };

    this.db.imports.unshift(item);

    return {
      message: 'Import lancé.',
      importId: item.id,
      status: item.status,
      fileName: item.fileName,
    };
  }

  findAll() {
    return this.db.imports;
  }

  findOne(id: string) {
    const item = this.db.imports.find((entry) => entry.id === id);

    if (!item) {
      throw new NotFoundException('Import introuvable.');
    }

    return item;
  }

  getErrors(id: string) {
    this.findOne(id);
    return this.db.importErrors.filter((entry) => entry.importId === id);
  }
}
