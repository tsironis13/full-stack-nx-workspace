export type LoginWithEmailAndPasswordPostDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  data: {
    user: AuthUserDto;
    session: SessionDto;
  };
  error: Record<string, unknown>;
};

export type AuthUserDto = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type SessionDto = {
  access_token: string;
  refresh_token: string;
};
