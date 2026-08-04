'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { useGetCareLinks } from '@/entities/care-link';
import { useGetMedications, useMedicationMutations } from '@/entities/medication';
import { UserAppHeader, UserBottomNav } from '@/widgets/user-navigation';

type CaregiverScreenType = 'edit' | 'list' | 'main' | 'new' | 'report' | 'settings';

interface CaregiverViewProps {
  screen: CaregiverScreenType;
}

const cards = Array.from({ length: 5 });

const CaregiverView = ({ screen }: CaregiverViewProps) => {
  const [search, setSearch] = useState<string>('');
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>('');
  const { data: careLinks } = useGetCareLinks();
  const patientId = careLinks?.find((careLink) => careLink.status === 'ACTIVE')?.patientId;
  const { data: medications, isLoading } = useGetMedications(patientId);

  if (screen === 'new' || screen === 'edit') return <MedicationForm isEdit={screen === 'edit'} />;
  if (screen === 'report') return <CaregiverReport />;
  if (screen === 'settings') return <CaregiverSettings />;

  return (
    <main className="min-h-dvh bg-neutral-100 pb-24">
      <div className="mx-auto max-w-[393px] px-5 pt-[62px]">
        {screen === 'main' ? <UserAppHeader /> : <SearchBar value={search} onChange={setSearch} />}
        <section className="mt-5 space-y-3">
          {isLoading && (
            <p className="py-10 text-center text-neutral-600">약 목록을 불러오는 중입니다.</p>
          )}
          {!isLoading && !patientId && (
            <p className="py-10 text-center text-neutral-600">연결된 복용자가 없습니다.</p>
          )}
          {medications?.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              onMore={() => {
                setSelectedMedicationId(medication.id);
                setIsMoreOpen(true);
              }}
            />
          ))}
        </section>
        <Link
          className="bg-primary-400 text-neutral-0 fixed right-5 bottom-[109px] left-5 z-10 mx-auto flex h-12 max-w-[353px] items-center justify-center rounded-full font-semibold shadow-[0_6px_0_#1c8dd3]"
          href="/caregiver/medications/new"
        >
          {screen === 'main' ? '새로운 약 등록하기' : '직접 등록하기'}
        </Link>
      </div>
      <UserBottomNav />
      {isMoreOpen && (
        <MoreSheet
          onClose={() => setIsMoreOpen(false)}
          onDelete={() => {
            setIsMoreOpen(false);
            setIsDeleteOpen(true);
          }}
        />
      )}
      {isDeleteOpen && (
        <DeleteDialog
          medicationId={selectedMedicationId}
          onClose={() => setIsDeleteOpen(false)}
          patientId={patientId}
        />
      )}
    </main>
  );
};

const MedicationCard = ({
  medication,
  onMore,
}: {
  medication: { dosage: string; instructions: string | null; name: string };
  onMore: () => void;
}) => (
  <article className="bg-neutral-0 flex min-h-[142px] gap-5 rounded-md p-5">
    <div className="relative size-[102px] shrink-0 overflow-hidden rounded-md border border-neutral-300">
      <Image
        className="object-cover"
        src="/medication-placeholder.png"
        alt="약 이미지"
        fill
        sizes="102px"
      />
    </div>
    <div className="min-w-0 flex-1">
      <button
        className="float-right text-2xl leading-none"
        type="button"
        aria-label="더보기"
        onClick={onMore}
      >
        ⋮
      </button>
      <h2 className="text-xl font-semibold">{medication.name}</h2>
      <p className="text-primary-400 mt-0.5 text-sm font-semibold">{medication.dosage}</p>
      <p className="mt-2 text-sm leading-5 text-neutral-600">
        {medication.instructions ?? '주의사항이 없습니다.'}
      </p>
    </div>
  </article>
);

const SearchBar = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <label className="bg-neutral-0 flex h-12 items-center rounded-full px-5 shadow-sm">
    <span className="mr-3 text-xl">⌕</span>
    <input
      className="min-w-0 flex-1 outline-none placeholder:text-neutral-400"
      value={value}
      placeholder="검색어를 입력해주세요"
      onChange={(event) => onChange(event.target.value)}
    />
    <span>×</span>
  </label>
);

const MedicationForm = ({ isEdit }: { isEdit: boolean }) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [time, setTime] = useState('');
  const { data: links } = useGetCareLinks();
  const patientId = links?.find((link) => link.status === 'ACTIVE')?.patientId;
  const { postMedication } = useMedicationMutations(patientId);
  const submit = () => {
    if (!patientId || !name || !dosage || !/^\d{2}:\d{2}$/.test(time)) return;
    postMedication.mutate({
      patientId,
      name,
      dosage,
      instructions,
      times: [time],
      daysOfWeek: ['0', '1', '2', '3', '4', '5', '6'],
      startDate: new Date().toISOString().slice(0, 10),
    });
  };
  return (
    <main className="bg-neutral-0 min-h-dvh pb-24">
      <div className="mx-auto max-w-[393px] px-5 pt-[72px]">
        <label className="flex h-[178px] items-center justify-center border border-dashed border-neutral-400 text-neutral-600">
          ⇧ 사진 업로드
          <input className="sr-only" type="file" accept="image/*" />
        </label>
        <div className="mt-5 space-y-4">
          <input
            className="h-12 w-full rounded-md bg-neutral-100 px-4"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="약 이름을 입력해주세요"
          />
          <input
            className="h-12 w-full rounded-md bg-neutral-100 px-4"
            value={dosage}
            onChange={(event) => setDosage(event.target.value)}
            placeholder="약의 용량을 입력해주세요"
          />
          <input
            className="h-12 w-full rounded-md bg-neutral-100 px-4"
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="그 외 주의사항을 입력해주세요"
          />
          <input
            className="h-12 w-full rounded-md bg-neutral-100 px-4"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            placeholder="약 복용 시간을 적어주세요 (ex: 09:30)"
          />
        </div>
        <button
          className="bg-primary-400 text-neutral-0 mt-[180px] h-12 w-full rounded-full font-semibold shadow-[0_6px_0_#1c8dd3]"
          type="button"
          onClick={submit}
        >
          {isEdit ? '수정하기' : '등록하기'}
        </button>
      </div>
      <UserBottomNav />
    </main>
  );
};

const CaregiverSettings = () => (
  <main className="bg-neutral-0 min-h-dvh pb-24">
    <div className="mx-auto max-w-[393px] px-5 pt-[62px]">
      <UserAppHeader />
      <button
        className="mt-9 flex h-12 w-full items-center justify-between rounded-md bg-neutral-100 px-5 text-left"
        type="button"
      >
        초대 코드 복사하기 <Image src="/auth-copy.svg" alt="" width={24} height={24} />
      </button>
    </div>
    <UserBottomNav />
  </main>
);

const MoreSheet = ({ onClose, onDelete }: { onClose: () => void; onDelete: () => void }) => (
  <div className="bg-neutral-1000/45 fixed inset-0 z-20" role="dialog">
    <section className="bg-neutral-0 absolute right-0 bottom-0 left-0 rounded-t-2xl pb-5">
      <h2 className="py-5 text-center text-xl font-semibold">더보기</h2>
      <Link className="block px-8 py-3" href="/caregiver/medications/edit">
        내용 수정
      </Link>
      <button
        className="text-system-error block w-full px-8 py-3 text-left"
        type="button"
        onClick={onDelete}
      >
        약 삭제
      </button>
      <button
        className="mx-5 mt-3 h-10 w-[calc(100%-40px)] rounded-full bg-neutral-100"
        type="button"
        onClick={onClose}
      >
        취소
      </button>
    </section>
  </div>
);

const DeleteDialog = ({
  medicationId,
  onClose,
  patientId,
}: {
  medicationId: string;
  onClose: () => void;
  patientId?: string;
}) => {
  const { deleteMedication } = useMedicationMutations(patientId);
  return (
    <div className="bg-neutral-1000/45 fixed inset-0 z-30 px-5" role="dialog">
      <section className="bg-neutral-0 mx-auto mt-[274px] max-w-[353px] rounded-xl p-6 text-center">
        <p className="text-system-error text-4xl">!</p>
        <h2 className="mt-4 text-xl font-semibold">정말 삭제하시겠습니까?</h2>
        <p className="mt-2 text-sm text-neutral-600">한번 삭제한 약은 다시 복구할 수 없습니다.</p>
        <button
          className="bg-system-error text-neutral-0 mt-8 h-10 w-full rounded-full font-semibold"
          type="button"
          onClick={() => deleteMedication.mutate(medicationId, { onSuccess: onClose })}
        >
          삭제하기
        </button>
        <button className="mt-3 h-10 w-full text-neutral-500" type="button" onClick={onClose}>
          취소
        </button>
      </section>
    </div>
  );
};

const CaregiverReport = () => (
  <main className="bg-neutral-0 min-h-dvh pb-24">
    <div className="mx-auto max-w-[393px] px-5 pt-[62px]">
      <UserAppHeader />
      <div className="mt-9 flex gap-2">
        <button className="bg-primary-400 text-neutral-0 h-9 rounded-full px-5 font-semibold">
          일간리포트
        </button>
        <button className="text-neutral-0 h-9 rounded-full bg-neutral-400 px-5 font-semibold">
          월간리포트
        </button>
      </div>
      <h2 className="mt-7 border-b border-neutral-200 pb-2">복용 완료한 약</h2>
      {cards.slice(0, 4).map((_, index) => (
        <button
          className="mt-2 flex h-[89px] w-full items-center justify-between rounded-md bg-neutral-50 px-5 text-left"
          type="button"
          key={index}
        >
          <span>
            <strong className="block text-xl">약 이름</strong>
            <small className="text-primary-400 mt-0.5 block text-sm font-semibold">
              1알 / 저녁 식사 후
            </small>
          </span>
          <Image src="/arrow-right.svg" alt="상세 보기" width={6} height={10} />
        </button>
      ))}
    </div>
    <UserBottomNav />
  </main>
);

export default CaregiverView;
