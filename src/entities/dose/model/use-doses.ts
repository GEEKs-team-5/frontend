'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getTodayDoses, getWeeklyAdherence, patchDoseTaken } from '../api/dose';

export const doseQueryKeys = {
  getTodayDoses: (patientId?: string) => ['doses', 'today', patientId] as const,
  getWeeklyAdherence: (patientId?: string) => ['doses', 'weekly-adherence', patientId] as const,
} as const;

export const useGetTodayDoses = (patientId?: string) =>
  useQuery({
    queryKey: doseQueryKeys.getTodayDoses(patientId),
    queryFn: () => getTodayDoses(patientId as string),
    enabled: Boolean(patientId),
  });

export const useGetWeeklyAdherence = (patientId?: string) =>
  useQuery({
    queryKey: doseQueryKeys.getWeeklyAdherence(patientId),
    queryFn: () => getWeeklyAdherence(patientId as string),
    enabled: Boolean(patientId),
  });

export const usePatchDoseTaken = (patientId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchDoseTaken,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: doseQueryKeys.getTodayDoses(patientId) }),
  });
};
