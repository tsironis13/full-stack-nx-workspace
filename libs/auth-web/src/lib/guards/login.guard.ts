import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthStore } from '../application/public-api';

export const loginGuard = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  return auth.authUser()
    ? router.navigate(['/']) // redirect authenticated users
    : true;
};
