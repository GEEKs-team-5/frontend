'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getUserProfile, patchUserProfile } from '../api/user';
import type { UpdateUserProfileReqType } from './types';

export const userQueryKeys = {
  getProfile: () => ['user', 'profile'] as const,
} as const;

export const useGetUserProfile = () =>
  useQuery({ queryKey: userQueryKeys.getProfile(), queryFn: getUserProfile });

export const usePatchUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateUserProfileReqType) => patchUserProfile(request),
    onSuccess: (profile) => queryClient.setQueryData(userQueryKeys.getProfile(), profile),
  });
};
