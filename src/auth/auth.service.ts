import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InMemoryDatabaseService } from '../common/in-memory-database.service';

type RegisterBody = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
};

type LoginBody = {
  email: string;
  password: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly db: InMemoryDatabaseService) {}

  register(body: RegisterBody) {
    const now = new Date().toISOString();
    const user = {
      id: randomUUID(),
      organizationId: this.db.organization.id,
      firstName: body.firstName ?? 'Utilisateur',
      lastName: body.lastName ?? 'Optiboost',
      email: body.email,
      passwordHash: `hash:${body.password}`,
      role: 'manager' as const,
      provider: 'local' as const,
      createdAt: now,
      updatedAt: now,
    };

    this.db.users.push(user);

    return {
      message: 'Compte créé avec succès.',
      user: this.sanitizeUser(user),
      organization: this.db.organization,
      tokens: this.generateTokens(user.id),
    };
  }

  login(body: LoginBody) {
    const user =
      this.db.users.find((entry) => entry.email === body.email) ??
      this.db.users[0];

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return {
      message: 'Connexion réussie.',
      user: this.sanitizeUser(user),
      organization: this.db.organization,
      tokens: this.generateTokens(user.id),
    };
  }

  google(body: { idToken?: string; email?: string }) {
    const user =
      this.db.users.find((entry) => entry.email === body.email) ??
      this.db.users[0];

    return {
      message: 'Connexion Google simulée.',
      provider: 'google',
      idTokenReceived: Boolean(body.idToken),
      user: this.sanitizeUser(user),
      organization: this.db.organization,
      tokens: this.generateTokens(user.id),
    };
  }

  refresh(body: { refreshToken?: string }) {
    return {
      message: 'Token renouvelé.',
      receivedRefreshToken: body.refreshToken ?? null,
      tokens: this.generateTokens(this.db.users[0].id),
    };
  }

  logout(body: { refreshToken?: string }) {
    return {
      message: 'Déconnexion effectuée.',
      revoked: Boolean(body.refreshToken),
    };
  }

  forgotPassword(body: { email: string }) {
    return {
      message:
        'Si ce compte existe, un e-mail de réinitialisation a été envoyé.',
      email: body.email,
    };
  }

  resetPassword(body: { token: string; password: string }) {
    return {
      message: 'Mot de passe réinitialisé.',
      tokenAccepted: Boolean(body.token),
      passwordUpdated: Boolean(body.password),
    };
  }

  me() {
    const user = this.db.users[0];

    return {
      user: this.sanitizeUser(user),
      organization: this.db.organization,
    };
  }

  private generateTokens(userId: string) {
    return {
      accessToken: `access-${userId}-${randomUUID()}`,
      refreshToken: `refresh-${userId}-${randomUUID()}`,
      expiresIn: 3600,
    };
  }

  private sanitizeUser(user: InMemoryDatabaseService['users'][number]) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
