import { post } from '@/shared';

export interface PrescriptionOcrReqType {
  imageBase64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface OcrMedicationResponseType {
  confidence: number;
  dose: string | null;
  durationDays: number | null;
  frequencyPerDay: number | null;
  instructions: string | null;
  lowConfidenceFields: string[];
  name: string;
  requiresConfirmation: boolean;
}

export interface PrescriptionOcrResponseType {
  disclaimer: string;
  medications: OcrMedicationResponseType[];
  requiresConfirmation: boolean;
}

export const analyzePrescriptionOcr = (request: PrescriptionOcrReqType) =>
  post<PrescriptionOcrResponseType>('api/v1/prescriptions/ocr/base64', request);
