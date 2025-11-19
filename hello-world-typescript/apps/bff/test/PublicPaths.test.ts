import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';

describe('PublicPaths', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const publicPaths = [
    { path: '/hello', method: 'GET', brand: 'NRMA' },
  ];

  test.each(publicPaths)('Given the path "%s" with method "%s" is public, then it should return 200 without authentication', async ({ path, method, brand }) => {
    const req = request(app.getHttpServer());
    const response = await req[method.toLowerCase()](path)
      .set('X-Iag-Brand', brand);

    expect(response.status).toBe(200);
  });
});
