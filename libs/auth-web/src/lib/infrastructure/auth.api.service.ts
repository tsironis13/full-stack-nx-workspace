import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AuthUserDto,
  LoginResponseDto,
  LoginWithEmailAndPasswordPostDto,
} from './auth.api.model';

export const AUTH_API_URL_TOKEN = new InjectionToken<string>(
  'AUTH_API_URL_TOKEN'
);

@Injectable()
export class AuthApiService {
  readonly #http = inject(HttpClient);
  readonly #authApiUrl = inject(AUTH_API_URL_TOKEN);

  public loginWithEmailAndPassword(
    loginWithEmailAndPasswordPostDto: LoginWithEmailAndPasswordPostDto
  ): Observable<LoginResponseDto> {
    return this.#http.post<LoginResponseDto>(
      `${this.#authApiUrl}/login`,
      loginWithEmailAndPasswordPostDto
    );
  }

  public getCurrentAuthUser(): Observable<AuthUserDto> {
    return this.#http.get<AuthUserDto>(`${this.#authApiUrl}/me`);
  }
}
