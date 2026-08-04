'use client';

import { useState } from 'react';

import Image from 'next/image';

import { useGetUserProfile, usePatchUserProfile } from '@/entities/user';
import { usePostAcceptInvitation } from '@/features/auth';
import { UserAppHeader, UserBottomNav } from '@/widgets/user-navigation';

type SettingsPanelType = 'invite' | 'profile' | null;

const UserSettingsView = () => {
  const [panel, setPanel] = useState<SettingsPanelType>(null);
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | ''>('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const { data: profile } = useGetUserProfile();
  const patchUserProfileMutation = usePatchUserProfile();
  const postAcceptInvitationMutation = usePostAcceptInvitation();

  return (
    <main className="bg-neutral-0 min-h-dvh pb-24">
      <div className="mx-auto max-w-[480px] px-5 pt-[62px]">
        <UserAppHeader />
        <section className="mt-[36px] space-y-3" aria-label="설정 목록">
          <button
            className="text-neutral-1000 flex h-12 w-full items-center justify-between rounded-md bg-neutral-100 px-5 text-left text-base"
            type="button"
            onClick={() => {
              setAge(profile?.age ? String(profile.age) : '');
              setGender(
                profile?.gender === 'FEMALE' ? 'FEMALE' : profile?.gender === 'MALE' ? 'MALE' : '',
              );
              setPanel('profile');
            }}
          >
            나이/성별 변경하기
            <Image src="/arrow-right.svg" alt="" width={24} height={24} />
          </button>
          <button
            className="text-neutral-1000 flex h-12 w-full items-center justify-between rounded-md bg-neutral-100 px-5 text-left text-base"
            type="button"
            onClick={() => setPanel('invite')}
          >
            초대 코드 재입력
            <Image src="/arrow-right.svg" alt="" width={24} height={24} />
          </button>
        </section>
        <p className="absolute right-5 bottom-[119px] left-5 mx-auto max-w-[440px] text-xs leading-[18px] text-neutral-400">
          *본 서비스의 약 품목 및 성분 정보는 식품의약품안전처 공공 API를 활용하였습니다.
        </p>
      </div>
      <UserBottomNav />
      {panel && (
        <div className="bg-neutral-1000/45 fixed inset-0 z-20 px-5" role="dialog" aria-modal="true">
          <section className="bg-neutral-0 mx-auto mt-[180px] max-w-[440px] rounded-xl p-6">
            <h2 className="text-xl font-semibold">
              {panel === 'profile' ? '나이와 성별 변경' : '초대 코드 재입력'}
            </h2>
            {panel === 'profile' ? (
              <div className="mt-5 space-y-3">
                <input
                  className="h-12 w-full rounded-md bg-neutral-100 px-4"
                  type="number"
                  min="1"
                  value={age}
                  placeholder="나이"
                  onChange={(event) => setAge(event.target.value)}
                />
                <select
                  className="h-12 w-full rounded-md border border-neutral-300 px-4"
                  value={gender}
                  onChange={(event) => setGender(event.target.value as 'MALE' | 'FEMALE' | '')}
                >
                  <option value="">성별 선택</option>
                  <option value="FEMALE">여성</option>
                  <option value="MALE">남성</option>
                </select>
                <button
                  className="bg-primary-400 text-neutral-0 h-10 w-full rounded-full font-semibold"
                  type="button"
                  disabled={!age || !gender || patchUserProfileMutation.isPending}
                  onClick={() =>
                    patchUserProfileMutation.mutate(
                      { age: Number(age), gender: gender || undefined },
                      { onSuccess: () => setPanel(null) },
                    )
                  }
                >
                  저장
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <input
                  className="h-12 w-full rounded-md bg-neutral-100 px-4"
                  value={inviteCode}
                  placeholder="6자리 초대 코드"
                  onChange={(event) => setInviteCode(event.target.value)}
                />
                <button
                  className="bg-primary-400 text-neutral-0 h-10 w-full rounded-full font-semibold"
                  type="button"
                  disabled={!/^\d{6}$/.test(inviteCode) || postAcceptInvitationMutation.isPending}
                  onClick={() =>
                    postAcceptInvitationMutation.mutate(inviteCode, {
                      onSuccess: () => setPanel(null),
                    })
                  }
                >
                  연결하기
                </button>
              </div>
            )}
            <button
              className="mt-3 h-10 w-full text-neutral-500"
              type="button"
              onClick={() => setPanel(null)}
            >
              취소
            </button>
          </section>
        </div>
      )}
    </main>
  );
};

export default UserSettingsView;
