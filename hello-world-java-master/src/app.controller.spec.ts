import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Response } from 'express';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHelloWorld', () => {
    it('should return "Hello world!"', () => {
      jest.spyOn(appService, 'getHelloWorld').mockReturnValue({ message: 'Hello world!' });
      expect(appController.getHelloWorld()).toEqual({ message: 'Hello world!' });
    });
  });

  describe('getHelloView', () => {
    it('should send the index.html file', () => {
      const mockResponse = { sendFile: jest.fn() } as unknown as Response;
      appController.getHelloView(mockResponse);
      expect(mockResponse.sendFile).toHaveBeenCalledWith('index.html', { root: 'views' });
    });
  });
});
