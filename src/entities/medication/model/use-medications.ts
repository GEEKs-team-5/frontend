'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteMedication,
  getMedications,
  patchMedication,
  postMedication,
} from '../api/medication';
export const medicationQueryKeys = {
  list: (patientId?: string) => ['medications', 'list', patientId] as const,
};
export const useGetMedications = (patientId?: string) =>
  useQuery({
    queryKey: medicationQueryKeys.list(patientId),
    queryFn: () => getMedications(patientId as string),
    enabled: Boolean(patientId),
  });
export const useMedicationMutations = (patientId?: string) => {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: medicationQueryKeys.list(patientId) });
  return {
    postMedication: useMutation({ mutationFn: postMedication, onSuccess: refresh }),
    patchMedication: useMutation({
      mutationFn: ({
        id,
        request,
      }: {
        id: string;
        request: Parameters<typeof patchMedication>[1];
      }) => patchMedication(id, request),
      onSuccess: refresh,
    }),
    deleteMedication: useMutation({ mutationFn: deleteMedication, onSuccess: refresh }),
  };
};
