import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: 'Optiboost Backend API',
      version: '1.0.0',
      status: 'ok',
      prefix: '/api/v1',
      modules: [
        'auth',
        'dashboard',
        'clients',
        'purchases',
        'imports',
        'segments',
        'campaigns',
        'templates',
        'simulator',
      ],
    };
  }
}
