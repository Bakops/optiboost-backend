import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect(({ body }) => {
        expect(body.status).toBe('ok');
        expect(body.modules).toContain('auth');
      });
  });

  it('/api/v1/dashboard/overview (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/dashboard/overview')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toHaveProperty('averageBasket');
        expect(body).toHaveProperty('segments');
      });
  });

  it('/api/v1/clients?status=À relancer (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/clients')
      .query({ status: 'À relancer' })
      .expect(200)
      .expect(({ body }) => {
        expect(Array.isArray(body.data)).toBe(true);
        expect(
          body.data.every(
            (client: { status: string }) => client.status === 'À relancer',
          ),
        ).toBe(true);
      });
  });

  it('auth session flow', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'owner@optique-martin.fr', password: 'demo123' })
      .expect(201);

    const accessToken = loginResponse.body.tokens.accessToken as string;
    const refreshToken = loginResponse.body.tokens.refreshToken as string;

    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.user.email).toBe('owner@optique-martin.fr');
      });

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(201);

    expect(refreshResponse.body.tokens.accessToken).not.toBe(accessToken);

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .send({ refreshToken: refreshResponse.body.tokens.refreshToken })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${refreshResponse.body.tokens.accessToken}`)
      .expect(401);
  });
});
