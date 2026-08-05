export type DoseStatusType = 'PENDING' | 'TAKEN' | 'MISSED' | 'SKIPPED';

export const DOSE_STATUS_META: Record<DoseStatusType, { canMarkTaken: boolean; label: string }> = {
  PENDING: { canMarkTaken: true, label: '복용했어요!' },
  TAKEN: { canMarkTaken: false, label: '복용 완료' },
  MISSED: { canMarkTaken: true, label: '복용 미완료' },
  SKIPPED: { canMarkTaken: false, label: '복용 건너뜀' },
};

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

export interface WeekdayAdherenceResponseType {
  adherenceRate: number;
  dayOfWeek: number;
  label: string;
  scheduledCount: number;
  takenCount: number;
}

export interface MonthlyWeekdayAdherenceResponseType {
  month: string;
  patientId: string;
  throughDate: string | null;
  weekdays: WeekdayAdherenceResponseType[];
}
