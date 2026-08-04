export const authUrl = {
  postLogin: () => 'api/v1/auth/login',
  postRefresh: () => 'api/v1/auth/refresh',
  postRegister: () => 'api/v1/auth/register',
} as const;
