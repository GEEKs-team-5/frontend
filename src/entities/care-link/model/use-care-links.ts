'use client';

import { useQuery } from '@tanstack/react-query';

import { getCareLinks } from '../api/care-link';

export const useGetCareLinks = () =>
  useQuery({ queryKey: ['care-links'] as const, queryFn: getCareLinks });
