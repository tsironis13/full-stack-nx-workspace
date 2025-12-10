import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { AuthApiService } from '../infrastructure/auth.api.service';
import { AuthUser, Session } from '../domain/public-api';
import {
  loginResponseDtoToAuthModel,
  authUserDtoToAuthUserModel,
} from './auth.mapper';

@Injectable()
export class AuthDataService {
  readonly #authApiService = inject(AuthApiService);

  public loginWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Observable<{ authUser: AuthUser; session: Session }> {
    return this.#authApiService
      .loginWithEmailAndPassword({ email, password })
      .pipe(
        map((loginResponseDto) => loginResponseDtoToAuthModel(loginResponseDto))
      );
  }

  public getCurrentAuthUser(): Observable<AuthUser> {
    return this.#authApiService
      .getCurrentAuthUser()
      .pipe(map((authUserDto) => authUserDtoToAuthUserModel(authUserDto)));
  }
}
