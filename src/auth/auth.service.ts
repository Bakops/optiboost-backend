import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InMemoryDatabaseService } from '../common/in-memory-database.service';
import type { AuthSession } from '../common/domain.types';

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

const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

@Injectable()
export class AuthService {
  constructor(private readonly db: InMemoryDatabaseService) {}

  register(body: RegisterBody) {
    const normalizedEmail = body.email.trim().toLowerCase();
    const existingUser = this.db.users.find(
      (entry) => entry.email.toLowerCase() === normalizedEmail,
    );

    if (existingUser) {
      throw new ConflictException('Un compte existe déjà avec cet e-mail.');
    }

    const now = new Date().toISOString();
    const user = {
      id: randomUUID(),
      organizationId: this.db.organization.id,
      firstName: body.firstName ?? 'Utilisateur',
      lastName: body.lastName ?? 'Optiboost',
      email: normalizedEmail,
      passwordHash: this.hashPassword(body.password),
      role: 'manager' as const,
      provider: 'local' as const,
      createdAt: now,
      updatedAt: now,
    };

    this.db.users.push(user);

    if (body.organizationName?.trim()) {
      this.db.organization.name = body.organizationName.trim();
      this.db.organization.updatedAt = now;
    }

    const tokens = this.createSession(user.id);

    return {
      message: 'Compte créé avec succès.',
      user: this.sanitizeUser(user),
      organization: this.db.organization,
      tokens: this.toTokensPayload(tokens),
    };
  }

  login(body: LoginBody) {
    const user = this.db.users.find(
      (entry) => entry.email.toLowerCase() === body.email.trim().toLowerCase(),
    );

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    if (!this.verifyPassword(body.password, user.passwordHash)) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const tokens = this.createSession(user.id);

    return {
      message: 'Connexion réussie.',
      user: this.sanitizeUser(user),
      organization: this.db.organization,
      tokens: this.toTokensPayload(tokens),
    };
  }

  google(body: { idToken?: string; email?: string }) {
    const normalizedEmail = body.email?.trim().toLowerCase();
    let user = normalizedEmail
      ? this.db.users.find((entry) => entry.email.toLowerCase() === normalizedEmail)
      : this.db.users[0];

    if (!user) {
      const now = new Date().toISOString();
      user = {
        id: randomUUID(),
        organizationId: this.db.organization.id,
        firstName: 'Google',
        lastName: 'User',
        email: normalizedEmail ?? `google-${randomUUID()}@optiboost.local`,
        passwordHash: this.hashPassword(randomUUID()),
        role: 'manager',
        provider: 'google',
        googleId: body.idToken ?? randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      this.db.users.push(user);
    }

    const tokens = this.createSession(user.id);

    return {
      message: 'Connexion Google simulée.',
      provider: 'google',
      idTokenReceived: Boolean(body.idToken),
      user: this.sanitizeUser(user),
      organization: this.db.organization,
      tokens: this.toTokensPayload(tokens),
    };
  }

  refresh(body: { refreshToken?: string }) {
    if (!body.refreshToken) {
      throw new UnauthorizedException('Refresh token manquant.');
    }

    const currentSession = this.getActiveSessionByRefreshToken(body.refreshToken);
    const user = this.getUserById(currentSession.userId);

    currentSession.revokedAt = new Date().toISOString();
    const nextSession = this.createSession(user.id);

    return {
      message: 'Token renouvelé.',
      user: this.sanitizeUser(user),
      organization: this.db.organization,
      tokens: this.toTokensPayload(nextSession),
    };
  }

  logout(body: { refreshToken?: string }, authorization?: string) {
    const accessToken = this.extractBearerToken(authorization);
    const refreshToken = body.refreshToken;
    const sessionsToRevoke = this.db.authSessions.filter((session) => {
      if (session.revokedAt) {
        return false;
      }

      return (
        session.accessToken === accessToken || session.refreshToken === refreshToken
      );
    });

    const revokedAt = new Date().toISOString();
    sessionsToRevoke.forEach((session) => {
      session.revokedAt = revokedAt;
    });

    return {
      message: 'Déconnexion effectuée.',
      revoked: sessionsToRevoke.length > 0,
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

  me(authorization?: string) {
    const accessToken = this.extractBearerToken(authorization);

    if (!accessToken) {
      throw new UnauthorizedException('Token d\'accès manquant.');
    }

    const session = this.getActiveSessionByAccessToken(accessToken);
    const user = this.getUserById(session.userId);

    return {
      user: this.sanitizeUser(user),
      organization: this.db.organization,
    };
  }

  private createSession(userId: string): AuthSession {
    const now = Date.now();
    const session: AuthSession = {
      id: randomUUID(),
      userId,
      accessToken: `access-${userId}-${randomUUID()}`,
      refreshToken: `refresh-${userId}-${randomUUID()}`,
      accessTokenExpiresAt: new Date(
        now + ACCESS_TOKEN_TTL_SECONDS * 1000,
      ).toISOString(),
      refreshTokenExpiresAt: new Date(
        now + REFRESH_TOKEN_TTL_SECONDS * 1000,
      ).toISOString(),
      createdAt: new Date(now).toISOString(),
      revokedAt: null,
    };

    this.db.authSessions.push(session);
    return session;
  }

  private toTokensPayload(session: AuthSession) {
    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    };
  }

  private getActiveSessionByAccessToken(accessToken: string) {
    const session = this.db.authSessions.find(
      (entry) =>
        entry.accessToken === accessToken &&
        !entry.revokedAt &&
        new Date(entry.accessTokenExpiresAt).getTime() > Date.now(),
    );

    if (!session) {
      throw new UnauthorizedException('Session invalide ou expirée.');
    }

    return session;
  }

  private getActiveSessionByRefreshToken(refreshToken: string) {
    const session = this.db.authSessions.find(
      (entry) =>
        entry.refreshToken === refreshToken &&
        !entry.revokedAt &&
        new Date(entry.refreshTokenExpiresAt).getTime() > Date.now(),
    );

    if (!session) {
      throw new UnauthorizedException('Refresh token invalide ou expiré.');
    }

    return session;
  }

  private extractBearerToken(authorization?: string) {
    if (!authorization?.startsWith('Bearer ')) {
      return null;
    }

    return authorization.slice('Bearer '.length).trim();
  }

  private getUserById(userId: string) {
    const user = this.db.users.find((entry) => entry.id === userId);

    if (!user) {
      throw new UnauthorizedException('Utilisateur de session introuvable.');
    }

    return user;
  }

  private hashPassword(password: string) {
    return `hash:${password}`;
  }

  private verifyPassword(password: string, passwordHash: string) {
    return passwordHash === this.hashPassword(password);
  }

  private sanitizeUser(user: InMemoryDatabaseService['users'][number]) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
