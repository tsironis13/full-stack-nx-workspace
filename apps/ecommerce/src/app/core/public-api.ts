export { isDeepEmpty } from './utils';
export { authInterceptor } from './auth/auth.interceptor';
export { REQUIRES_AUTH } from './auth/requires-auth.context';
export {
  provideEcommerceI18n,
  UiLanguageService,
  mapHttpErrorToTranslocoKey,
  encodeMachineText,
  localizeA2uiValue,
  type UiLanguage,
} from './i18n/public-api';
