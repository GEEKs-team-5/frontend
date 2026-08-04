'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useGetCareLinks } from '@/entities/care-link';
import {
  type TodayDoseItemResponseType,
  useGetMonthlyWeekdayAdherence,
  useGetTodayDoses,
} from '@/entities/dose';
import {
  type DrugInteractionItemResponseType,
  type DrugType,
  getDrugInteractions,
  getDrugSearch,
} from '@/entities/drug';
import { useGetMedications, useMedicationMutations } from '@/entities/medication';
import { usePostAcceptInvitation } from '@/features/auth';
import { COOKIE_KEYS, deleteCookie } from '@/shared';
import { UserAppHeader, UserBottomNav } from '@/widgets/user-navigation';

type CaregiverScreenType = 'edit' | 'list' | 'main' | 'new' | 'report' | 'settings';

interface CaregiverViewProps {
  screen: CaregiverScreenType;
}

const CaregiverView = ({ screen }: CaregiverViewProps) => {
  const [search, setSearch] = useState<string>('');
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>('');
  const [drugCandidates, setDrugCandidates] = useState<DrugType[] | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<DrugType | null>(null);
  const [drugSearchError, setDrugSearchError] = useState<string | null>(null);
  const [isDrugSearching, setIsDrugSearching] = useState<boolean>(false);
  const router = useRouter();
  const { data: careLinks } = useGetCareLinks();
  const patientId = careLinks?.find((careLink) => careLink.status === 'ACTIVE')?.patientId;
  const { data: medications, isLoading } = useGetMedications(patientId);

  const handleDrugSearch = async () => {
    if (!search.trim()) return;

    setDrugSearchError(null);
    setIsDrugSearching(true);

    try {
      const { items } = await getDrugSearch(search.trim());
      setDrugCandidates(items);
    } catch {
      setDrugSearchError('약 정보를 찾을 수 없습니다. 다시 시도해주세요.');
    } finally {
      setIsDrugSearching(false);
    }
  };

  const handleSelectDrug = (drug: DrugType) =>
    router.push(`/caregiver/medications/new?name=${encodeURIComponent(drug.name)}`);

  if (screen === 'new' || screen === 'edit') return <MedicationForm isEdit={screen === 'edit'} />;
  if (screen === 'report') return <CaregiverReport />;
  if (screen === 'settings') return <CaregiverSettings />;

  return (
    <main className="min-h-dvh bg-neutral-100 pb-24">
      <div className="mx-auto max-w-[480px] px-5 pt-[62px]">
        {screen === 'main' ? (
          <UserAppHeader />
        ) : (
          <SearchBar value={search} onChange={setSearch} onSearch={() => void handleDrugSearch()} />
        )}
        <section className="mt-5 space-y-3">
          {screen === 'list' && isDrugSearching && (
            <p className="py-10 text-center text-neutral-600">약 정보를 불러오는 중입니다.</p>
          )}
          {screen === 'list' && drugSearchError && (
            <p className="text-system-error py-10 text-center">{drugSearchError}</p>
          )}
          {screen === 'list' && drugCandidates?.length === 0 && (
            <p className="py-10 text-center text-neutral-600">검색 결과가 없습니다.</p>
          )}
          {screen === 'list' &&
            drugCandidates?.map((drug) => (
              <DrugSearchResultCard drug={drug} key={drug.itemSeq} onOpen={setSelectedDrug} />
            ))}
          {screen === 'main' && isLoading && (
            <p className="py-10 text-center text-neutral-600">약 목록을 불러오는 중입니다.</p>
          )}
          {screen === 'main' && !isLoading && !patientId && (
            <p className="py-10 text-center text-neutral-600">연결된 복용자가 없습니다.</p>
          )}
          {screen === 'main' &&
            medications?.map((medication) => (
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
          className="bg-primary-400 text-neutral-0 fixed right-5 bottom-[109px] left-5 z-10 mx-auto flex h-12 max-w-[440px] items-center justify-center rounded-full font-semibold shadow-[0_6px_0_#1c8dd3]"
          href={screen === 'main' ? '/caregiver/medications' : '/caregiver/medications/new'}
        >
          {screen === 'main' ? '새로운 약 등록하기' : '직접 등록하기'}
        </Link>
      </div>
      <UserBottomNav />
      {selectedDrug && (
        <DrugSelectionDetailDialog
          drug={selectedDrug}
          onClose={() => setSelectedDrug(null)}
          onSelect={handleSelectDrug}
        />
      )}
      {isMoreOpen && (
        <MoreSheet
          medicationId={selectedMedicationId}
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

const SearchBar = ({
  value,
  onChange,
  onSearch,
}: {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}) => (
  <form
    className="bg-neutral-0 flex h-12 items-center rounded-full px-5 shadow-sm"
    onSubmit={(event) => {
      event.preventDefault();
      onSearch();
    }}
  >
    <span className="mr-3 text-xl">⌕</span>
    <input
      className="min-w-0 flex-1 outline-none placeholder:text-neutral-400"
      value={value}
      placeholder="검색어를 입력해주세요"
      onChange={(event) => onChange(event.target.value)}
    />
    <span>×</span>
  </form>
);

const DrugSearchResultCard = ({
  drug,
  onOpen,
}: {
  drug: DrugType;
  onOpen: (drug: DrugType) => void;
}) => (
  <button
    className="bg-neutral-0 flex min-h-[119px] w-full gap-5 rounded-md p-5 text-left"
    type="button"
    onClick={() => onOpen(drug)}
  >
    <div className="relative size-[79px] shrink-0 overflow-hidden rounded-md border border-neutral-300">
      <Image
        className="object-cover"
        src="/medication-placeholder.png"
        alt="약 이미지"
        fill
        sizes="79px"
      />
    </div>
    <div className="min-w-0 pt-0.5">
      <h2 className="text-neutral-1000 truncate text-xl font-semibold">{drug.name}</h2>
      {drug.manufacturer && <p className="mt-1 text-sm text-neutral-600">{drug.manufacturer}</p>}
    </div>
  </button>
);

const DrugSelectionDetailDialog = ({
  drug,
  onClose,
  onSelect,
}: {
  drug: DrugType;
  onClose: () => void;
  onSelect: (drug: DrugType) => void;
}) => (
  <div
    className="bg-neutral-1000/45 fixed inset-0 z-20 px-5"
    role="dialog"
    aria-modal="true"
    aria-label="약 선택"
  >
    <section className="bg-neutral-0 mx-auto mt-[80px] max-w-[440px] rounded-xl p-6">
      <div className="relative aspect-square overflow-hidden rounded-md border border-neutral-300">
        <Image
          className="object-cover"
          src="/medication-placeholder.png"
          alt={`${drug.name} 이미지`}
          fill
          sizes="305px"
        />
      </div>
      <div className="mt-4">
        <h2 className="text-neutral-1000 text-2xl font-semibold">{drug.name}</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          {drug.manufacturer ? `${drug.manufacturer} 제품입니다.` : '의약품 정보를 확인해주세요.'}
        </p>
      </div>
      <button
        className="bg-primary-400 text-neutral-0 mt-9 h-10 w-full rounded-full text-base font-semibold shadow-[0_6px_0_#1c8dd3]"
        type="button"
        onClick={() => onSelect(drug)}
      >
        이 약 선택하기
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

const MedicationForm = ({ isEdit }: { isEdit: boolean }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const medicationId = searchParams.get('id');
  const [name, setName] = useState(searchParams.get('name') ?? '');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [time, setTime] = useState('');
  const [drugCandidates, setDrugCandidates] = useState<DrugType[] | null>(null);
  const [interactionWarning, setInteractionWarning] = useState<InteractionWarningType | null>(null);
  const [interactionError, setInteractionError] = useState<string | null>(null);
  const [isCheckingInteraction, setIsCheckingInteraction] = useState(false);
  const { data: links } = useGetCareLinks();
  const patientId = links?.find((link) => link.status === 'ACTIVE')?.patientId;
  const { data: medications } = useGetMedications(patientId);
  const editMedication = medications?.find((medication) => medication.id === medicationId);
  const { patchMedication, postMedication } = useMedicationMutations(patientId);

  const saveMedication = (medicationName: string) => {
    const request = {
      name: medicationName,
      dosage,
      instructions,
      times: [time],
      daysOfWeek: editMedication?.schedules.map((schedule) => schedule.dayOfWeek) ?? [
        0, 1, 2, 3, 4, 5, 6,
      ],
    };

    if (isEdit && medicationId) {
      patchMedication.mutate(
        { id: medicationId, request },
        { onSuccess: () => router.replace('/caregiver') },
      );
      return;
    }

    if (!patientId) return;

    postMedication.mutate(
      {
        patientId,
        ...request,
        startDate: new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date()),
      },
      { onSuccess: () => router.replace('/caregiver') },
    );
  };

  const checkInteraction = async (drug: DrugType) => {
    setDrugCandidates(null);
    setIsCheckingInteraction(true);

    try {
      const interactions = await getDrugInteractions(drug.itemSeq);
      const warning = interactions.items.find((interaction) =>
        medications?.some(
          (medication) =>
            normalizeMedicationName(medication.name) ===
            normalizeMedicationName(interaction.contraindicatedDrugName ?? ''),
        ),
      );
      const medication = medications?.find(
        (item) =>
          normalizeMedicationName(item.name) ===
          normalizeMedicationName(warning?.contraindicatedDrugName ?? ''),
      );

      if (warning && medication) {
        setInteractionWarning({ drug, medicationName: medication.name, warning });
        return;
      }

      saveMedication(drug.name);
    } catch {
      setInteractionError('약물 상호작용을 확인하지 못했습니다. 다시 시도해주세요.');
    } finally {
      setIsCheckingInteraction(false);
    }
  };

  const submit = async () => {
    if (!patientId || !name || !dosage || !/^\d{2}:\d{2}$/.test(time)) return;
    setInteractionError(null);

    if (isEdit && medicationId) {
      saveMedication(name);
      return;
    }

    setIsCheckingInteraction(true);

    try {
      const { items } = await getDrugSearch(name);
      if (!items.length) {
        setInteractionError('약 정보를 찾을 수 없습니다. 정확한 제품명을 입력해주세요.');
        return;
      }

      setDrugCandidates(items);
    } catch {
      setInteractionError('약 정보를 찾을 수 없습니다. 다시 시도해주세요.');
    } finally {
      setIsCheckingInteraction(false);
    }
  };

  useEffect(() => {
    if (!isEdit || !editMedication) return;

    setName(editMedication.name);
    setDosage(editMedication.dosage);
    setInstructions(editMedication.instructions ?? '');
    setTime(editMedication.schedules[0]?.time ?? '');
  }, [editMedication, isEdit]);
  return (
    <main className="bg-neutral-0 min-h-dvh pb-24">
      <div className="mx-auto max-w-[480px] px-5 pt-[72px]">
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
        {interactionError && <p className="text-system-error mt-3 text-sm">{interactionError}</p>}
        <button
          className="bg-primary-400 text-neutral-0 mt-[180px] h-12 w-full rounded-full font-semibold shadow-[0_6px_0_#1c8dd3]"
          type="button"
          onClick={submit}
          disabled={isCheckingInteraction}
        >
          {isCheckingInteraction ? '검사 중...' : isEdit ? '수정하기' : '등록하기'}
        </button>
      </div>
      <UserBottomNav />
      {drugCandidates && (
        <DrugSelectionDialog
          drugs={drugCandidates}
          onClose={() => setDrugCandidates(null)}
          onSelect={(drug) => void checkInteraction(drug)}
        />
      )}
      {interactionWarning && (
        <DrugInteractionWarningDialog
          warning={interactionWarning}
          onCancel={() => setInteractionWarning(null)}
          onConfirm={() => {
            saveMedication(interactionWarning.drug.name);
            setInteractionWarning(null);
          }}
        />
      )}
    </main>
  );
};

interface InteractionWarningType {
  drug: DrugType;
  medicationName: string;
  warning: DrugInteractionItemResponseType;
}

const normalizeMedicationName = (medicationName: string) =>
  medicationName.replaceAll(' ', '').toLocaleLowerCase('ko-KR');

interface DrugSelectionDialogProps {
  drugs: DrugType[];
  onClose: () => void;
  onSelect: (drug: DrugType) => void;
}

const DrugSelectionDialog = ({ drugs, onClose, onSelect }: DrugSelectionDialogProps) => (
  <div className="bg-neutral-1000/45 fixed inset-0 z-20 px-5" role="dialog" aria-modal="true">
    <section className="bg-neutral-0 mx-auto mt-[120px] max-w-[440px] rounded-xl p-6">
      <h2 className="text-xl font-semibold">등록할 약을 선택해주세요</h2>
      <div className="mt-5 max-h-[360px] space-y-2 overflow-y-auto">
        {drugs.map((drug) => (
          <button
            className="w-full rounded-md bg-neutral-100 px-4 py-3 text-left"
            type="button"
            key={drug.itemSeq}
            onClick={() => onSelect(drug)}
          >
            <strong className="block">{drug.name}</strong>
            {drug.manufacturer && (
              <span className="mt-1 block text-sm text-neutral-600">{drug.manufacturer}</span>
            )}
          </button>
        ))}
      </div>
      <button className="mt-3 h-10 w-full text-neutral-500" type="button" onClick={onClose}>
        취소
      </button>
    </section>
  </div>
);

interface DrugInteractionWarningDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
  warning: InteractionWarningType;
}

const DrugInteractionWarningDialog = ({
  onCancel,
  onConfirm,
  warning,
}: DrugInteractionWarningDialogProps) => (
  <div className="bg-neutral-1000/45 fixed inset-0 z-30 px-5" role="dialog" aria-modal="true">
    <section className="bg-neutral-0 mx-auto mt-[160px] max-w-[440px] rounded-xl p-6 text-center">
      <div className="flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-4">
          <Image src="/drug-interaction-warning.svg" alt="경고" width={48} height={48} />
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold">약물 상호작용 주의</h2>
            <p className="text-base leading-[1.2] text-neutral-600">
              <strong>&apos;{warning.drug.name}&apos;</strong>은(는) 현재 복용 중인{' '}
              <strong>&apos;{warning.medicationName}&apos;</strong>과(와) 함께 드실 경우{' '}
              {warning.warning.reason
                ? `${warning.warning.reason}을 유발할 수 있습니다.`
                : '주의가 필요할 수 있습니다.'}
              <br />
              정말 등록하시겠습니까?
            </p>
          </div>
        </div>
        <div className="w-full">
          <button
            className="text-neutral-0 w-full rounded-full bg-[#eb5757] px-5 py-4 font-semibold"
            type="button"
            onClick={onConfirm}
          >
            확인
          </button>
          <button
            className="w-full rounded-xl px-5 py-4 font-semibold text-neutral-600"
            type="button"
            onClick={onCancel}
          >
            취소
          </button>
        </div>
      </div>
    </section>
  </div>
);

const CaregiverSettings = () => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const router = useRouter();
  const postAcceptInvitationMutation = usePostAcceptInvitation();

  const handleLogout = () => {
    deleteCookie(COOKIE_KEYS.ACCESS_TOKEN);
    deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
    router.replace('/signin');
  };

  return (
    <main className="bg-neutral-0 min-h-dvh pb-24">
      <div className="mx-auto max-w-[480px] px-5 pt-[62px]">
        <UserAppHeader />
        <button
          className="mt-9 flex h-12 w-full items-center justify-between rounded-md bg-neutral-100 px-5 text-left"
          type="button"
          onClick={() => setIsInviteOpen(true)}
        >
          초대 코드 재입력 <Image src="/arrow-right.svg" alt="" width={6} height={10} />
        </button>
        <button
          className="text-system-error mt-3 flex h-12 w-full items-center justify-center rounded-md bg-neutral-100 text-base"
          type="button"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>
      <UserBottomNav />
      {isInviteOpen && (
        <div className="bg-neutral-1000/45 fixed inset-0 z-20 px-5" role="dialog" aria-modal="true">
          <section className="bg-neutral-0 mx-auto mt-[180px] max-w-[440px] rounded-xl p-6">
            <h2 className="text-xl font-semibold">초대 코드 재입력</h2>
            <input
              className="mt-5 h-12 w-full rounded-md bg-neutral-100 px-4"
              value={inviteCode}
              placeholder="6자리 초대 코드"
              onChange={(event) => setInviteCode(event.target.value)}
            />
            {postAcceptInvitationMutation.isError && (
              <p className="text-system-error mt-3 text-sm">초대 코드를 확인해주세요.</p>
            )}
            <button
              className="bg-primary-400 text-neutral-0 mt-5 h-10 w-full rounded-full font-semibold"
              type="button"
              disabled={!/^\d{6}$/.test(inviteCode) || postAcceptInvitationMutation.isPending}
              onClick={() =>
                postAcceptInvitationMutation.mutate(inviteCode, {
                  onSuccess: () => {
                    setInviteCode('');
                    setIsInviteOpen(false);
                  },
                })
              }
            >
              연결하기
            </button>
            <button
              className="mt-3 h-10 w-full text-neutral-500"
              type="button"
              onClick={() => setIsInviteOpen(false)}
            >
              취소
            </button>
          </section>
        </div>
      )}
    </main>
  );
};

const MoreSheet = ({
  medicationId,
  onClose,
  onDelete,
}: {
  medicationId: string;
  onClose: () => void;
  onDelete: () => void;
}) => (
  <div className="bg-neutral-1000/45 fixed inset-0 z-20" role="dialog">
    <section className="bg-neutral-0 absolute right-0 bottom-0 left-0 mx-auto max-w-[480px] rounded-t-2xl pb-5">
      <h2 className="py-5 text-center text-xl font-semibold">더보기</h2>
      <Link className="block px-8 py-3" href={`/caregiver/medications/edit?id=${medicationId}`}>
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
      <section className="bg-neutral-0 mx-auto mt-[274px] max-w-[440px] rounded-xl p-6 text-center">
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

const CaregiverReport = () => {
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [selectedDose, setSelectedDose] = useState<TodayDoseItemResponseType | null>(null);
  const { data: careLinks } = useGetCareLinks();
  const patientId = careLinks?.find((careLink) => careLink.status === 'ACTIVE')?.patientId;
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const { data: todayDoses } = useGetTodayDoses(patientId);
  const { data: monthlyWeekdayAdherence } = useGetMonthlyWeekdayAdherence(patientId, currentMonth);
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

    return Math.round((weekday?.adherenceRate ?? 0) * 100);
  });

  return (
    <main className="bg-neutral-0 min-h-dvh pb-24">
      <div className="mx-auto max-w-[480px] px-5 pt-[62px]">
        <UserAppHeader />
        <div className="mt-9 flex gap-2">
          <button
            className={`h-9 rounded-full px-5 font-semibold ${reportType === 'daily' ? 'bg-primary-400 text-neutral-0' : 'text-neutral-0 bg-neutral-400'}`}
            type="button"
            onClick={() => setReportType('daily')}
          >
            일간리포트
          </button>
          <button
            className={`h-9 rounded-full px-5 font-semibold ${reportType === 'monthly' ? 'bg-primary-400 text-neutral-0' : 'text-neutral-0 bg-neutral-400'}`}
            type="button"
            onClick={() => setReportType('monthly')}
          >
            월간리포트
          </button>
        </div>
        {reportType === 'daily' ? (
          <section className="mt-7">
            <h2 className="border-b border-neutral-200 pb-2">복용 완료한 약</h2>
            {todayDoses?.items
              .filter((dose) => dose.status === 'TAKEN')
              .map((dose) => (
                <button
                  className="mt-2 flex h-[89px] w-full items-center justify-between rounded-md bg-neutral-50 px-5 text-left"
                  type="button"
                  key={dose.id}
                  onClick={() => setSelectedDose(dose)}
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
          </section>
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
        <CaregiverMedicationDetailDialog
          dose={selectedDose}
          onClose={() => setSelectedDose(null)}
        />
      )}
    </main>
  );
};

interface CaregiverMedicationDetailDialogProps {
  dose: TodayDoseItemResponseType;
  onClose: () => void;
}

const CaregiverMedicationDetailDialog = ({
  dose,
  onClose,
}: CaregiverMedicationDetailDialogProps) => (
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
        className="mt-9 h-10 w-full text-base font-semibold text-neutral-500"
        type="button"
        onClick={onClose}
      >
        닫기
      </button>
    </section>
  </div>
);

export default CaregiverView;
