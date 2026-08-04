'use client';

import Image from 'next/image';

import { useGetTodayDoses, usePatchDoseTaken } from '@/entities/dose';
import { useGetUserProfile } from '@/entities/user';
import { UserAppHeader, UserBottomNav } from '@/widgets/user-navigation';

const UserHomeView = () => {
  const { data: profile } = useGetUserProfile();
  const patientId = profile?.activeRole === 'PATIENT' ? profile.id : undefined;
  const { data: todayDoses, isLoading } = useGetTodayDoses(patientId);
  const patchDoseTakenMutation = usePatchDoseTaken(patientId);
  const nextDose = todayDoses?.items.find((dose) => dose.status === 'PENDING');

  return (
    <main className="min-h-dvh bg-neutral-100 pb-24">
      <div className="mx-auto max-w-[393px] px-5 pt-[62px]">
        <UserAppHeader />
        <section className="bg-neutral-0 mt-5 rounded-xl px-5 py-5 text-center">
          <p className="text-sm text-neutral-600">
            {nextDose ? `(${nextDose.scheduledAt.slice(11, 16)} 복용약)` : '오늘 예정된 약'}
          </p>
          <h1 className="text-neutral-1000 text-xl font-semibold">
            {nextDose ? '다음 약 복용을 확인해주세요' : '오늘의 복약을 확인해주세요'}
          </h1>
        </section>
        <section className="mt-5 space-y-0" aria-label="오늘의 복약 목록">
          {isLoading && (
            <p className="py-10 text-center text-neutral-600">복약 정보를 불러오는 중입니다.</p>
          )}
          {!isLoading && !patientId && (
            <p className="py-10 text-center text-neutral-600">
              복용자 계정에서 이용할 수 있습니다.
            </p>
          )}
          {todayDoses?.items.map((dose) => {
            const isPending = dose.status === 'PENDING';

            return (
              <article
                className="bg-neutral-0 relative overflow-hidden px-5 pt-9 pb-5"
                key={dose.id}
              >
                <div className="absolute top-0 left-0 h-4 w-full bg-neutral-100 [clip-path:polygon(0_100%,6.8%_0,13.6%_100%,20.4%_0,27.2%_100%,34%_0,40.8%_100%,47.6%_0,54.4%_100%,61.2%_0,68%_100%,74.8%_0,81.6%_100%,88.4%_0,95.2%_100%,100%_25%,100%_100%)]" />
                <div className="flex gap-5">
                  <div className="relative size-[102px] shrink-0 overflow-hidden rounded-md border border-neutral-300 bg-neutral-100">
                    <Image
                      className="object-cover"
                      src="/medication-placeholder.png"
                      alt="약 이미지"
                      fill
                      sizes="102px"
                    />
                  </div>
                  <div className="min-w-0 pt-1">
                    <h2 className="text-neutral-1000 truncate text-xl font-semibold">
                      {dose.medication.name}
                    </h2>
                    <p className="text-primary-400 mt-0.5 text-sm font-semibold">
                      {dose.medication.dosage}
                    </p>
                    <p className="mt-2 text-sm leading-5 text-neutral-600">
                      {dose.medication.instructions ?? '주의사항이 없습니다.'}
                    </p>
                  </div>
                </div>
                <button
                  className={`mt-[17px] h-10 w-full rounded-full text-base font-semibold ${isPending ? 'bg-primary-400 text-neutral-0 shadow-[0_6px_0_#1c8dd3]' : 'text-neutral-0 bg-neutral-400'}`}
                  type="button"
                  disabled={!isPending || patchDoseTakenMutation.isPending}
                  onClick={() => patchDoseTakenMutation.mutate(dose.id)}
                >
                  {isPending ? '복용했어요!' : '복용 완료'}
                </button>
              </article>
            );
          })}
        </section>
      </div>
      <UserBottomNav />
    </main>
  );
};

export default UserHomeView;
