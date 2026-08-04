import Image from 'next/image';

import { UserAppHeader, UserBottomNav } from '@/widgets/user-navigation';

const UserSettingsView = () => (
  <main className="bg-neutral-0 min-h-dvh pb-24">
    <div className="mx-auto max-w-[393px] px-5 pt-[62px]">
      <UserAppHeader />
      <section className="mt-[36px] space-y-3" aria-label="설정 목록">
        {['나이/성별 변경하기', '초대 코드 재입력'].map((label) => (
          <button
            className="text-neutral-1000 flex h-12 w-full items-center justify-between rounded-md bg-neutral-100 px-5 text-left text-base"
            type="button"
            key={label}
          >
            {label}
            <Image src="/arrow-right.svg" alt="" width={24} height={24} />
          </button>
        ))}
      </section>
      <p className="absolute right-5 bottom-[119px] left-5 mx-auto max-w-[353px] text-xs leading-[18px] text-neutral-400">
        *본 서비스의 약 품목 및 성분 정보는 식품의약품안전처 공공 API를 활용하였습니다.
      </p>
    </div>
    <UserBottomNav />
  </main>
);

export default UserSettingsView;
