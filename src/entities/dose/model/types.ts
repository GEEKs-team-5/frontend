export type DoseStatusType = 'PENDING' | 'TAKEN' | 'MISSED' | 'SKIPPED';

export interface MedicationBriefResponseType {
  dosage: string;
  id: string;
  instructions: string | null;
  name: string;
}

export interface TodayDoseItemResponseType {
  id: string;
  medication: MedicationBriefResponseType;
  scheduledAt: string;
  status: DoseStatusType;
  takenAt: string | null;
}

export interface TodayDosesResponseType {
  date: string;
  items: TodayDoseItemResponseType[];
  patientId: string;
}

export interface WeeklyAdherenceResponseType {
  adherenceRate: number | null;
  daily: { adherenceRate: number | null; date: string }[];
  patientId: string;
  scheduledCount: number;
  takenCount: number;
  weekEnd: string;
  weekStart: string;
}
