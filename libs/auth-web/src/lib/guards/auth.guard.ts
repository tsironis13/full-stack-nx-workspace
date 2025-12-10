import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthStore } from '../application/public-api';

export const authGuard = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  return auth.authUser() ? true : router.navigate(['/login']);
};
