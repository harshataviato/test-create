import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { FeaturesModule } from './features/features.module';
import { FoundationModule } from './foundation/foundation.module';
import { HelloWorldModule } from './features/hello-world/HelloWorldModule';
import { FeatureFlagsService } from '@iag-ct/simple-feature-flags';

class StubFeatureFlagsService extends FeatureFlagsService {
  constructor() { super({} as any); }
  isFeatureEnabled(flagKey: string, defaultValue: boolean, context?: any): Promise<boolean> {
    return Promise.resolve(defaultValue);
  }
  beforeApplicationShutdown(): Promise<void> { return Promise.resolve(); }
}

describe('AppModule', () => {
  let app: INestApplication;
  let stubFeatureFlagsService: FeatureFlagsService;

  beforeAll(async () => {
    stubFeatureFlagsService = new StubFeatureFlagsService();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .useMocker((dependency) => {
      if (dependency === FeatureFlagsService) {
        return stubFeatureFlagsService;
      }
      return undefined;
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('Given AppModule is loaded, then FeaturesModule should be present', () => {
    expect(app.get(FeaturesModule)).toBeDefined();
  });

  test('Given AppModule is loaded, then FoundationModule should be present', () => {
    expect(app.get(FoundationModule)).toBeDefined();
  });

  test('Given HelloWorld feature is needed, when AppModule is loaded, then HelloWorldModule should be present', () => {
    expect(app.get(HelloWorldModule)).toBeDefined();
  });
});
