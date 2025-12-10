import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { appTheme } from '../themes/app-theme';
import {
  AUTH_API_URL_TOKEN,
  AuthDataService,
  AuthStore,
  AuthApiService,
} from '@full-stack-nx-workspace/auth-web';

const provideAuthServices = () => [
  AuthStore,
  AuthDataService,
  AuthApiService,
  { provide: AUTH_API_URL_TOKEN, useValue: '/api/auth' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: appTheme,
        options: {
          options: {
            darkModeSelector: '.ecommerce-app-dark',
          },
        },
      },
    }),
    provideAuthServices(),
  ],
};
