import { authUrl, post } from '@/shared';

import type { AuthResponseType, LoginReqType, RegisterReqType } from '../model/types';

export const postLogin = (request: LoginReqType) =>
  post<AuthResponseType>(authUrl.postLogin(), request);

export const postRegister = (request: RegisterReqType) =>
  post<AuthResponseType>(authUrl.postRegister(), request);
