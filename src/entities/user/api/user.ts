import { get, patch } from '@/shared';

import type { UpdateUserProfileReqType, UserProfileResponseType } from '../model/types';

const userUrl = {
  getProfile: () => 'api/v1/users/me',
  patchProfile: () => 'api/v1/users/me/profile',
} as const;

export const getUserProfile = () => get<UserProfileResponseType>(userUrl.getProfile());

export const patchUserProfile = (request: UpdateUserProfileReqType) =>
  patch<UserProfileResponseType>(userUrl.patchProfile(), request);
