import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloWorldModule } from './endpoints/hello-world/HelloWorldModule';

describe('AppModule', () => {
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  test('Given app is loaded, then AppController should be defined', () => {
    expect(app.get(AppController)).toBeDefined();
  });

  test('Given app is loaded, then AppService should be defined', () => {
    expect(app.get(AppService)).toBeDefined();
  });

  test('Given HelloWorld feature is needed, when AppModule is loaded, then HelloWorldModule should be present', () => {
    expect(app.get(HelloWorldModule)).toBeDefined();
  });
});
