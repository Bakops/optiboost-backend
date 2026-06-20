import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getApiInfo', () => {
    it('should return API metadata', () => {
      const appController = app.get(AppController);
      expect(appController.getApiInfo()).toEqual(
        expect.objectContaining({
          status: 'ok',
          prefix: '/api/v1',
        }),
      );
    });
  });
});
