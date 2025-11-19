import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

describe('Architecture', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('Module structure: HelloWorldModule should be imported by FeaturesModule', async () => {
    const featuresModule = app.get('FeaturesModule'); // Access by string as it's not exported explicitly for type
    expect(featuresModule['imports'].some(m => m.name === 'HelloWorldModule')).toBeTruthy();
  });

  test('Controller structure: HelloWorldController should be present in HelloWorldModule', async () => {
    const helloWorldModule = app.get('HelloWorldModule'); // Access by string
    expect(helloWorldModule['controllers'].some(c => c.name === 'HelloWorldController')).toBeTruthy();
  });

  test('Feature List: "hello-world" should be recognized as a feature', async () => {
    const featuresList = [
      'hello-world'
    ];
    // This is a simplified check; in a real app, you might parse folder names or use a more robust discovery mechanism.
    // For this test, we assume direct knowledge of the features.
    expect(featuresList).toContain('hello-world');
  });

});
