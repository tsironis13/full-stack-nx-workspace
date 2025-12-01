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

import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { appTheme } from '../themes/app-theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes, withComponentInputBinding()),
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
  ],
};
