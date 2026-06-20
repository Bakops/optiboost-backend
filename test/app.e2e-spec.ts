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
});
