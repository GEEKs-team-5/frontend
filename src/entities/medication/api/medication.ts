import { del, get, patch, post } from '@/shared';

export interface MedicationResponseType {
  dosage: string;
  id: string;
  instructions: string | null;
  name: string;
}

export interface MedicationReqType {
  daysOfWeek: number[];
  dosage: string;
  instructions?: string;
  name: string;
  patientId: string;
  startDate: string;
  times: string[];
}

export const getMedications = (patientId: string) =>
  get<MedicationResponseType[]>(`api/v1/patients/${patientId}/medications`);
export const postMedication = (request: MedicationReqType) =>
  post<MedicationResponseType>('api/v1/medications', request);
export const patchMedication = (id: string, request: Partial<MedicationReqType>) =>
  patch<MedicationResponseType>(`api/v1/medications/${id}`, request);
export const deleteMedication = (id: string) => del(`api/v1/medications/${id}`);
