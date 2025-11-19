import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HelloWorldModule } from './HelloWorldModule';
import { FeatureFlagsService } from '@iag-ct/simple-feature-flags';

class StubFeatureFlagsService extends FeatureFlagsService {
  constructor() { super({} as any); }
  isFeatureEnabled(flagKey: string, defaultValue: boolean, context?: any): Promise<boolean> {
    return Promise.resolve(defaultValue);
  }
  beforeApplicationShutdown(): Promise<void> { return Promise.resolve(); }
}

let app: INestApplication;
let stubFeatureFlagsService: FeatureFlagsService;

describe('HelloWorldFeature', () => {
  beforeAll(async () => {
    stubFeatureFlagsService = new StubFeatureFlagsService();
    const testingModule = await Test.createTestingModule({
      imports: [HelloWorldModule],
    })
    .useMocker((dependency) => {
      if (dependency === FeatureFlagsService) {
        return stubFeatureFlagsService;
      }
      return undefined;
    }).compile();

    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const supportedBrands = ['NRMA'].map(brand => ({ brand }));

  test.each(supportedBrands)('Given %s is supported and feature flag is on, when calling hello endpoint, then it returns success with "Hello world!"', async ({ brand }) => {
    jest.spyOn(stubFeatureFlagsService, 'isFeatureEnabled').mockResolvedValue(true);
    const response = await request(app.getHttpServer()).get('/api/hello').set('X-Iag-Brand', brand);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Hello world!' });
  });

  test.each(supportedBrands)('Given %s is supported and feature flag is off, when calling hello endpoint, then it returns 500 error (feature disabled)', async ({ brand }) => {
    jest.spyOn(stubFeatureFlagsService, 'isFeatureEnabled').mockResolvedValue(false);
    const response = await request(app.getHttpServer()).get('/api/hello').set('X-Iag-Brand', brand);
    expect(response.status).toBe(500);
  });

  const unsupportedBrands = ['AMI', 'STATE'].map(brand => ({ brand }));

  test.each(unsupportedBrands)('Given unsupported %s, when calling hello endpoint, then should return 404 (brand not supported)', async ({ brand }) => {
    const response = await request(app.getHttpServer()).get('/api/hello').set('X-Iag-Brand', brand);
    expect(response.status).toBe(404);
  });
});
