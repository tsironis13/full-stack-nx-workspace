import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { distinctUntilChanged, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

import { AuthUser } from '../domain/public-api';
import { AuthDataService } from '../data/public-api';
import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@full-stack-nx-workspace/store';

type LoginForm = { email: string; password: string };
type Session = {
  accessToken: string;
  refreshToken: string;
};

export type AuthState = {
  authUser: AuthUser | null;
  session: Session | null;
  loginForm: LoginForm | null;
};

const initialState: AuthState = {
  authUser: null,
  session: null,
  loginForm: { email: '', password: '' },
};

export const AuthStore = signalStore(
  withState(initialState),
  withRequestStatus(),
  withComputed(({ authUser, session }) => ({
    isAuthenticated: computed(
      () => authUser() !== null && session() !== null
    ),
  })),
  withProps(() => ({
    authService: inject(AuthDataService),
  })),
  withMethods((store) => ({
    loginWithEmailAndPassword: rxMethod<{ email: string; password: string }>(
      pipe(
        distinctUntilChanged(),
        tap(() => patchState(store, setPending())),
        switchMap((query) => {
          return store.authService.loginWithEmailAndPassword(query).pipe(
            tapResponse({
              next: ({ authUser, session }) => {
                patchState(
                  store,
                  { authUser, session },
                  setFulfilled()
                );
              },
              error: (err) => {
                patchState(
                  store,
                  { authUser: null, session: null },
                  setError((err as Error).message)
                );
              },
            })
          );
        })
      )
    ),
  }))
);
