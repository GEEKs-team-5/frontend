import { get, patch } from '@/shared';

import type { TodayDosesResponseType, WeeklyAdherenceResponseType } from '../model/types';

const doseUrl = {
  getTodayDoses: (patientId: string) => `api/v1/patients/${patientId}/doses/today`,
  getWeeklyAdherence: (patientId: string) => `api/v1/patients/${patientId}/adherence/weekly`,
  patchTaken: (occurrenceId: string) => `api/v1/doses/${occurrenceId}/taken`,
} as const;

export const getTodayDoses = (patientId: string) =>
  get<TodayDosesResponseType>(doseUrl.getTodayDoses(patientId));

export const getWeeklyAdherence = (patientId: string) =>
  get<WeeklyAdherenceResponseType>(doseUrl.getWeeklyAdherence(patientId));

export const patchDoseTaken = (occurrenceId: string) => patch(doseUrl.patchTaken(occurrenceId));
