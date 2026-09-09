import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideCopilotKit } from '@copilotkit/angular';
import { provideMarkdownRenderer } from '@a2ui/angular/v0_9';
import { marked } from 'marked';

import { authInterceptor, provideEcommerceI18n } from './core/public-api';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { appTheme } from '../themes/app-theme';
import {
  AUTH_API_URL_TOKEN,
  AuthStore,
  AuthApiService,
} from '@full-stack-nx-workspace/auth-web';
import { provideEnvConfig } from '../environments/environment';
import {
  a2uiActivityRendererConfig,
  provideA2uiCatalog,
} from '@full-stack-nx-workspace/shared';

const provideAuthServices = () => [
  AuthStore,
  AuthApiService,
  { provide: AUTH_API_URL_TOKEN, useValue: '/api/auth' },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideEnvConfig(),
    provideEcommerceI18n(),
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
    provideCopilotKit({
      defaultToolRendering: true,
      renderActivityMessages: [a2uiActivityRendererConfig],
    }),
    provideA2uiCatalog(),
    provideMarkdownRenderer(async (markdown) =>
      marked.parse(String(markdown ?? '')),
    ),
  ],
};
