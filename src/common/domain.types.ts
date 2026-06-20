export type ClientStatus = 'Fidèle' | 'À relancer' | 'Perdu';
export type ClientCategory = 'Premium' | 'Standard';
export type CampaignChannel = 'email' | 'sms' | 'whatsapp';
export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'completed'
  | 'paused'
  | 'cancelled';
export type ImportStatus = 'uploaded' | 'processing' | 'completed' | 'failed';

export interface Organization {
  id: string;
  name: string;
  industry: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: 'owner' | 'manager';
  provider: 'local' | 'google';
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  status: ClientStatus;
  category: ClientCategory;
  premiumStatus: boolean;
  lastPurchaseAt: string;
  totalSpent: number;
  source: 'import' | 'manual';
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  organizationId: string;
  clientId: string;
  amount: number;
  productType: string;
  productCategory: string;
  purchasedAt: string;
  createdAt: string;
}

export interface ImportJob {
  id: string;
  organizationId: string;
  uploadedByUserId: string;
  fileName: string;
  storagePath: string;
  status: ImportStatus;
  totalRows: number;
  importedRows: number;
  rejectedRows: number;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
}

export interface ImportErrorRow {
  id: string;
  importId: string;
  rowNumber: number;
  rawPayload: Record<string, string | number | null>;
  status: 'rejected';
  errorMessage: string;
}

export interface Segment {
  id: string;
  organizationId: string;
  name: string;
  rules: {
    lastPurchaseBeforeDays?: number;
    minTotalSpent?: number;
    hasEmail?: boolean;
    status?: ClientStatus;
    category?: ClientCategory;
  };
  estimatedCount: number;
  createdByUserId: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  segmentId: string;
  messageTemplate: string;
  scheduledAt: string | null;
  sentAt: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  clientId: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  repliedAt: string | null;
  failureReason: string | null;
}

export interface Template {
  id: string;
  organizationId: string;
  name: string;
  channel: CampaignChannel;
  content: string;
  createdAt: string;
  updatedAt: string;
}
