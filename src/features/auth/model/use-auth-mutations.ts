'use client';

import { useMutation } from '@tanstack/react-query';

import { COOKIE_KEYS, setCookie } from '@/shared';

import { postLogin, postRegister } from '../api/auth';
import { postAcceptInvitation, postCareInvitation } from '../api/care-link';

export const usePostLogin = () =>
  useMutation({
    mutationFn: postLogin,
    onSuccess: ({ accessToken, refreshToken }) => {
      setCookie(COOKIE_KEYS.ACCESS_TOKEN, accessToken);
      setCookie(COOKIE_KEYS.REFRESH_TOKEN, refreshToken);
    },
  });

export const usePostRegister = () =>
  useMutation({
    mutationFn: postRegister,
    onSuccess: ({ accessToken, refreshToken }) => {
      setCookie(COOKIE_KEYS.ACCESS_TOKEN, accessToken);
      setCookie(COOKIE_KEYS.REFRESH_TOKEN, refreshToken);
    },
  });

export const usePostCareInvitation = () => useMutation({ mutationFn: postCareInvitation });

export const usePostAcceptInvitation = () => useMutation({ mutationFn: postAcceptInvitation });
