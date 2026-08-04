import { get } from '@/shared';

export interface CareLinkResponseType {
  patientId: string;
  status: 'ACTIVE' | 'DISCONNECTED';
}

export const getCareLinks = () => get<CareLinkResponseType[]>('api/v1/care-links');
