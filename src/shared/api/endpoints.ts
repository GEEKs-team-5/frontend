export const authUrl = {
  postLogin: () => 'api/v1/auth/login',
  postRegister: () => 'api/v1/auth/register',
  putRefresh: () => 'api/v1/auth/refresh',
} as const;
