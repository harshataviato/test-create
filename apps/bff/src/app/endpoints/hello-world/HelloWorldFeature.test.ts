import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HelloWorldModule } from './HelloWorldModule';
import { FeatureFlagsService } from '@iag-ct/simple-feature-flags';

let app: INestApplication;
let stubFeatureFlagService: FeatureFlagsService;

describe('HelloWorldFeature', () => {
  beforeAll(async () => {
    stubFeatureFlagService = new StubFeatureFlagService();
    const testingModule = await Test.createTestingModule({
      imports: [HelloWorldModule],
    })
    .useMocker((dependency) => {
      switch (dependency) {
        case FeatureFlagsService: return stubFeatureFlagService;
        default: return undefined;
      }
    }).compile();
    
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const supportedBrands = ['NRMA'].map(brand => ({ brand }));

  test.each(supportedBrands)('Given %s is supported and feature flag is on, when calling hello endpoint, then it returns success', async ({ brand }) => {
    jest.spyOn(stubFeatureFlagService, 'isFeatureEnabled').mockResolvedValue(true);
    const response = await request(app.getHttpServer()).get('/hello').set('X-Iag-Brand', brand);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Hello world!' });
  });

  test.each(supportedBrands)('Given %s is supported and feature flag is off, when calling hello endpoint, then it returns 500 error', async ({ brand }) => {
    jest.spyOn(stubFeatureFlagService, 'isFeatureEnabled').mockResolvedValue(false);
    const response = await request(app.getHttpServer()).get('/hello').set('X-Iag-Brand', brand);
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Feature is disabled');
  });

  const unsupportedBrands = ['AMI', 'STATE'].map(brand => ({ brand }));

  test.each(unsupportedBrands)('Given unsupported %s, when calling hello endpoint, then should return 404', async ({ brand }) => {
    const response = await request(app.getHttpServer()).get('/hello').set('X-Iag-Brand', brand);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Brand not supported');
  });
});

class StubFeatureFlagService extends FeatureFlagsService {
  constructor() { super({} as any); }
  beforeApplicationShutdown(): Promise<void> { return Promise.resolve(); }
}
