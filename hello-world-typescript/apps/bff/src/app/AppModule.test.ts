import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { HelloWorldModule } from './features/hello-world/HelloWorldModule';

describe('AppModule', () => {
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

  test('Given HelloWorld feature is needed, when AppModule is loaded, then HelloWorldModule should be present', () => {
    expect(app.get(HelloWorldModule)).toBeDefined();
  });
});
