import { HttpContextToken } from '@angular/common/http';

/**
 * Opt-in marker for the {@link authInterceptor}.
 * Set this token to `true` on any request that must carry a Bearer token.
 *
 * @example
 * this.#http.get('/api/cart', {
 *   context: new HttpContext().set(REQUIRES_AUTH, true),
 * });
 */
export const REQUIRES_AUTH = new HttpContextToken<boolean>(() => false);
