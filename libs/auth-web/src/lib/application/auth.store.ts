import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { catchError, distinctUntilChanged, pipe, switchMap, tap } from 'rxjs';

import { LocalStorageFacade } from '@full-stack-nx-workspace/shared';
import {
  setError,
  setFulfilled,
  setPending,
  withRequestStatus,
} from '@full-stack-nx-workspace/store';

import type { AuthUser, Session } from '../domain/public-api';
import { AuthApiService } from '../infrastructure/public-api';
import type { AuthUserDto } from '../infrastructure/auth.api.model';

const AUTH_WEB_SESSION_STORAGE_KEY = 'auth-web:persisted-session';

type LoginForm = { email: string; password: string };

export type AuthState = {
  authUser: AuthUser | null;
  session: Session | null;
  loginForm: LoginForm | null;
};

type PersistedAuthSnapshot = {
  authUser: AuthUser;
  session: Session;
};

function authUserFromDto(dto: AuthUserDto): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    role: dto.role,
  };
}

function isPersistedAuthSnapshot(
  value: unknown,
): value is PersistedAuthSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  const session = v['session'];
  const authUser = v['authUser'];
  if (
    typeof session !== 'object' ||
    session === null ||
    typeof authUser !== 'object' ||
    authUser === null
  ) {
    return false;
  }
  const s = session as Record<string, unknown>;
  const u = authUser as Record<string, unknown>;
  return (
    typeof s['accessToken'] === 'string' &&
    s['accessToken'].length > 0 &&
    typeof s['refreshToken'] === 'string' &&
    typeof u['id'] === 'string' &&
    typeof u['email'] === 'string' &&
    typeof u['role'] === 'string'
  );
}

function readPersistedAuth(
  storage: LocalStorageFacade,
): PersistedAuthSnapshot | null {
  const raw = storage.getJson<unknown>(AUTH_WEB_SESSION_STORAGE_KEY);
  return isPersistedAuthSnapshot(raw) ? raw : null;
}

function persistAuth(
  storage: LocalStorageFacade,
  authUser: AuthUser,
  session: Session,
): void {
  storage.setJson<PersistedAuthSnapshot>(AUTH_WEB_SESSION_STORAGE_KEY, {
    authUser,
    session,
  });
}

function clearPersistedAuth(storage: LocalStorageFacade): void {
  storage.remove(AUTH_WEB_SESSION_STORAGE_KEY);
}

const initialState: AuthState = {
  authUser: null,
  session: null,
  loginForm: { email: '', password: '' },
};

export const AuthStore = signalStore(
  withState(initialState),
  withRequestStatus(),
  withComputed(({ authUser, session }) => ({
    isAuthenticated: computed(() => authUser() !== null && session() !== null),
  })),
  withProps(() => ({
    authApiService: inject(AuthApiService),
    storage: inject(LocalStorageFacade),
  })),
  withHooks({
    onInit(store) {
      const snapshot = readPersistedAuth(store.storage);

      if (snapshot) {
        patchState(store, {
          authUser: snapshot.authUser,
          session: snapshot.session,
        });
      }
    },
  }),
  withMethods((store) => ({
    logout(): void {
      clearPersistedAuth(store.storage);
      patchState(store, {
        authUser: null,
        session: null,
        loginForm: { email: '', password: '' },
        requestStatus: 'idle',
      });
    },
    loginWithEmailAndPassword: rxMethod<{ email: string; password: string }>(
      pipe(
        distinctUntilChanged(),
        tap(() => patchState(store, setPending())),
        switchMap((credentials) => {
          const attemptLogin$ = store.authApiService
            .loginWithEmailAndPassword(credentials)
            .pipe(
              tapResponse({
                next: ({ data: { user, session } }) => {
                  const sess: Session = {
                    accessToken: session.access_token,
                    refreshToken: session.refresh_token,
                  };
                  patchState(
                    store,
                    { authUser: user, session: sess },
                    setFulfilled(),
                  );
                  persistAuth(store.storage, user, sess);
                },
                error: (err) => {
                  patchState(
                    store,
                    { authUser: null, session: null },
                    setError((err as Error).message),
                  );
                },
              }),
            );

          const persisted = readPersistedAuth(store.storage);
          console.log(persisted);
          if (!persisted?.session.accessToken) {
            return attemptLogin$;
          }

          return store.authApiService
            .getCurrentAuthUser(persisted.session.accessToken)
            .pipe(
              tap({
                next: (userDto) => {
                  const user = authUserFromDto(userDto);
                  patchState(
                    store,
                    {
                      authUser: user,
                      session: persisted.session,
                    },
                    setFulfilled(),
                  );
                  persistAuth(store.storage, user, persisted.session);
                },
              }),
              catchError(() => {
                clearPersistedAuth(store.storage);
                return attemptLogin$;
              }),
            );
        }),
      ),
    ),
  })),
);
