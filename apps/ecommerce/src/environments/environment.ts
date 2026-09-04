import { InjectionToken } from '@angular/core';

import { EnvironmentModel } from './enviroment.model';

export const environment: EnvironmentModel = {
  baseUrl: 'http://localhost:3001',
  agUiUrl: 'http://localhost:3021/ag-ui',
  aiServerUrl: 'http://localhost:3021',
};

export const ENV_CONFIG = new InjectionToken<EnvironmentModel>('ENV_CONFIG');

export const provideEnvConfig = () => {
  return {
    provide: ENV_CONFIG,
    useValue: environment,
  };
};
