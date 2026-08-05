'use client';

import { useState } from 'react';

import Image from 'next/image';

import {
  DOSE_STATUS_META,
  type TodayDoseItemResponseType,
  useGetMonthlyWeekdayAdherence,
  useGetTodayDoses,
  usePatchDoseTaken,
} from '@/entities/dose';
import { useGetUserProfile } from '@/entities/user';
import { UserAppHeader, UserBottomNav } from '@/widgets/user-navigation';

const UserReportView = () => {
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [selectedDose, setSelectedDose] = useState<TodayDoseItemResponseType | null>(null);
  const { data: profile } = useGetUserProfile();
  const patientId = profile?.activeRole === 'PATIENT' ? profile.id : undefined;
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const { data: todayDoses } = useGetTodayDoses(patientId);
  const { data: monthlyWeekdayAdherence } = useGetMonthlyWeekdayAdherence(patientId, currentMonth);
  const patchDoseTakenMutation = usePatchDoseTaken();
  const monthlyWeekdays = monthlyWeekdayAdherence?.weekdays ?? [];
  const monthlyScheduledCount = monthlyWeekdays.reduce(
    (total, weekday) => total + weekday.scheduledCount,
    0,
  );
  const monthlyTakenCount = monthlyWeekdays.reduce(
    (total, weekday) => total + weekday.takenCount,
    0,
  );
  const monthlyRates = [1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
    const weekday = monthlyWeekdays.find((item) => item.dayOfWeek === dayOfWeek);

    return Math.round(weekday?.adherenceRate ?? 0);
  });

  return (
    <main className="bg-neutral-0 min-h-dvh pb-24">
      <div className="mx-auto max-w-[480px] px-5 pt-[62px]">
        <UserAppHeader />
        <div className="mt-[36px] flex gap-2">
          <button
            className={`h-[35px] w-[110px] rounded-full text-base font-semibold ${reportType === 'daily' ? 'bg-primary-400 text-neutral-0' : 'text-neutral-0 bg-neutral-400'}`}
            type="button"
            onClick={() => setReportType('daily')}
          >
            일간리포트
          </button>
          <button
            className={`h-[35px] w-[110px] rounded-full text-base font-semibold ${reportType === 'monthly' ? 'bg-primary-400 text-neutral-0' : 'text-neutral-0 bg-neutral-400'}`}
            type="button"
            onClick={() => setReportType('monthly')}
          >
            월간리포트
          </button>
        </div>
        {reportType === 'daily' ? (
          <div className="mt-7 space-y-6">
            <ReportMedicationSection
              title="복용 완료한 약"
              doses={todayDoses?.items.filter((dose) => dose.status === 'TAKEN') ?? []}
              onOpen={setSelectedDose}
            />
            <ReportMedicationSection
              title="복용 미완료 약"
              doses={todayDoses?.items.filter((dose) => dose.status !== 'TAKEN') ?? []}
              onOpen={setSelectedDose}
            />
          </div>
        ) : (
          <section className="mt-6">
            <div className="grid grid-cols-2 overflow-hidden rounded-xl bg-neutral-100">
              <div className="border-neutral-0 flex justify-between border-r px-4 py-4">
                <span>
                  <p className="text-sm text-neutral-700">월간 복용률</p>
                  <strong className="text-primary-400 text-2xl">
                    {monthlyScheduledCount
                      ? Math.round((monthlyTakenCount / monthlyScheduledCount) * 100)
                      : 0}
                    %
                  </strong>
                </span>
                <Image
                  className="size-6 shrink-0"
                  src="/report-rate.svg"
                  alt=""
                  width={24}
                  height={24}
                />
              </div>
              <div className="flex justify-between px-4 py-4">
                <span>
                  <p className="text-sm text-neutral-700">총 복용 횟수</p>
                  <strong className="text-primary-400 text-2xl">{monthlyScheduledCount}회</strong>
                </span>
                <Image
                  className="size-6 shrink-0"
                  src="/report-count.svg"
                  alt=""
                  width={24}
                  height={24}
                />
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-neutral-100 px-5 pt-5 pb-4">
              <h2 className="text-lg font-semibold">월간 요일별 약 복용률</h2>
              <div className="mt-8 flex h-[344px] items-end justify-between border-b border-neutral-300">
                {monthlyRates.map((rate, index) => (
                  <div className="flex h-full w-6 flex-col items-center justify-end" key={index}>
                    <span className="mb-1 text-xs text-neutral-700">{rate}%</span>
                    <div
                      className="bg-primary-400 w-6 rounded-t"
                      style={{ height: `${rate * 2.5}px` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between px-2 text-sm text-neutral-700">
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span>토</span>
                <span>일</span>
              </div>
            </div>
          </section>
        )}
      </div>
      <UserBottomNav />
      {selectedDose && (
        <MedicationDetailDialog
          dose={selectedDose}
          isMarkingTaken={patchDoseTakenMutation.isPending}
          onClose={() => setSelectedDose(null)}
          onTaken={() =>
            patchDoseTakenMutation.mutate(selectedDose.id, {
              onSuccess: () => setSelectedDose(null),
            })
          }
        />
      )}
    </main>
  );
};

interface ReportMedicationSectionProps {
  doses: TodayDoseItemResponseType[];
  onOpen: (dose: TodayDoseItemResponseType) => void;
  title: string;
}

const ReportMedicationSection = ({ doses, title, onOpen }: ReportMedicationSectionProps) => (
  <section>
    <h2 className="flex items-center gap-3 text-base font-medium before:content-[''] after:h-px after:flex-1 after:bg-neutral-200">
      {title}
    </h2>
    <div className="mt-3 space-y-2">
      {doses.map((dose) => (
        <button
          className="flex h-[89px] w-full items-center justify-between rounded-md bg-neutral-50 px-5 text-left"
          type="button"
          key={dose.id}
          onClick={() => onOpen(dose)}
        >
          <span>
            <strong className="block text-xl">{dose.medication.name}</strong>
            <small className="text-primary-400 mt-0.5 block text-sm font-semibold">
              {dose.medication.dosage}
            </small>
          </span>
          <Image src="/arrow-right.svg" alt="상세 보기" width={6} height={10} />
        </button>
      ))}
    </div>
  </section>
);

interface MedicationDetailDialogProps {
  dose: TodayDoseItemResponseType;
  isMarkingTaken: boolean;
  onClose: () => void;
  onTaken: () => void;
}

const MedicationDetailDialog = ({
  dose,
  isMarkingTaken,
  onClose,
  onTaken,
}: MedicationDetailDialogProps) => {
  const statusMeta = DOSE_STATUS_META[dose.status];

  return (
    <div
      className="bg-neutral-1000/45 fixed inset-0 z-20 px-5"
      role="dialog"
      aria-modal="true"
      aria-label="약 상세"
    >
      <section className="bg-neutral-0 mx-auto mt-[127px] max-w-[440px] rounded-xl p-6">
        <div className="relative aspect-square overflow-hidden rounded-md border border-neutral-300">
          <Image
            className="object-cover"
            src="/medication-placeholder.png"
            alt="약 이미지"
            fill
            sizes="305px"
          />
        </div>
        <div className="mt-4">
          <h2 className="text-neutral-1000 text-xl font-semibold">{dose.medication.name}</h2>
          <p className="text-primary-400 mt-0.5 text-sm font-semibold">{dose.medication.dosage}</p>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {dose.medication.instructions ?? '주의사항이 없습니다.'}
          </p>
        </div>
        <button
          className={`mt-9 h-10 w-full rounded-full text-base font-semibold ${statusMeta.canMarkTaken ? 'bg-primary-400 text-neutral-0 shadow-[0_6px_0_#1c8dd3]' : 'text-neutral-0 bg-neutral-400'}`}
          type="button"
          disabled={!statusMeta.canMarkTaken || isMarkingTaken}
          onClick={onTaken}
        >
          {statusMeta.label}
        </button>
        <button
          className="mt-3 h-10 w-full text-base font-semibold text-neutral-500"
          type="button"
          onClick={onClose}
        >
          취소
        </button>
      </section>
    </div>
  );
};

export default UserReportView;
