export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
};
