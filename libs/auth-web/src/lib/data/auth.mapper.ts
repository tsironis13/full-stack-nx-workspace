import {
  AuthUserDto,
  LoginResponseDto,
} from '../infrastructure/auth.api.model';
import { AuthUser, Session } from '../domain/public-api';

export const loginResponseDtoToAuthModel = (
  loginResponseDto: LoginResponseDto
): { authUser: AuthUser; session: Session } => {
  return {
    authUser: {
      id: loginResponseDto.user.id,
      email: loginResponseDto.user.email,
      name: loginResponseDto.user.name,
      role: loginResponseDto.user.role,
    },
    session: {
      accessToken: loginResponseDto.session.access_token,
      refreshToken: loginResponseDto.session.refresh_token,
    },
  };
};

export const authUserDtoToAuthUserModel = (
  authUserDto: AuthUserDto
): AuthUser => {
  return {
    id: authUserDto.id,
    email: authUserDto.email,
    name: authUserDto.name,
    role: authUserDto.role,
  };
};
