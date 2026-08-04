'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import { getNextScreen } from '../model/screen.mjs';

type ScreenType = 'splash' | 'start' | 'signin';

const AuthEntryView = () => {
  const [screen, setScreen] = useState<ScreenType>('splash');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const handleOpenSignIn = () => setScreen(getNextScreen('start', 'open-signin'));

  const handleGoBack = () => setScreen(getNextScreen('signin', 'go-back'));

  const handleTogglePasswordVisibility = () => setIsPasswordVisible((visible) => !visible);

  useEffect(() => {
    if (screen !== 'splash') return;

    const timeoutId = window.setTimeout(
      () => setScreen(getNextScreen('splash', 'splash-timeout')),
      1000,
    );

    return () => window.clearTimeout(timeoutId);
  }, [screen]);

  if (screen === 'splash') {
    return (
      <main className="bg-neutral-0 flex min-h-dvh items-center justify-center">
        <Image src="/medilink-logo.svg" alt="MediLink" width={180} height={33} priority />
      </main>
    );
  }

  if (screen === 'start') {
    return (
      <main className="bg-neutral-0 relative min-h-dvh px-5">
        <Image
          className="absolute top-[120px] left-1/2 -translate-x-1/2"
          src="/medilink-logo.svg"
          alt="MediLink"
          width={180}
          height={33}
        />
        <div className="absolute inset-x-5 bottom-[50px] flex flex-col gap-3">
          <button
            className="bg-primary-300 text-neutral-0 h-12 rounded-md text-base font-semibold"
            type="button"
          >
            회원가입
          </button>
          <button
            className="border-primary-300 bg-neutral-0 text-primary-300 h-12 rounded-md border text-base font-semibold"
            type="button"
            onClick={handleOpenSignIn}
          >
            로그인
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-neutral-0 flex min-h-dvh flex-col px-5 pt-[52px]">
      <button
        className="text-neutral-1000 -ml-1 flex size-8 items-center justify-center text-2xl leading-none"
        type="button"
        aria-label="시작 화면으로 돌아가기"
        onClick={handleGoBack}
      >
        ‹
      </button>
      <section className="mt-3">
        <h1 className="text-[32px] leading-[1.2] font-semibold text-neutral-800">
          <span className="inline-flex align-baseline">
            <Image src="/medilink-logo.svg" alt="MediLink" width={140} height={26} />
          </span>{' '}
          에 다시
          <br />
          오신 것을 환영해요!
        </h1>
        <form className="mt-8 flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
          <input
            className="focus:ring-primary-300 h-12 w-full rounded-md bg-neutral-100 px-4 text-base text-neutral-800 outline-none placeholder:text-neutral-500 focus:ring-1"
            type="email"
            placeholder="이메일을 입력해주세요."
            aria-label="이메일"
          />
          <div className="relative">
            <input
              className="focus:ring-primary-300 h-12 w-full rounded-md bg-neutral-100 py-0 pr-12 pl-4 text-base text-neutral-800 outline-none placeholder:text-neutral-500 focus:ring-1"
              type={isPasswordVisible ? 'text' : 'password'}
              placeholder="비밀번호를 입력해주세요."
              aria-label="비밀번호"
            />
            <button
              className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center"
              type="button"
              aria-label={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
              onClick={handleTogglePasswordVisibility}
            >
              <Image src="/auth-eye.svg" alt="" width={17} height={12} />
            </button>
          </div>
          <div className="mt-auto flex min-h-[calc(100dvh-356px)] flex-col justify-end pb-[10px]">
            <button
              className="bg-primary-300 text-neutral-0 h-12 rounded-md text-base font-semibold"
              type="submit"
            >
              로그인
            </button>
            <p className="mt-1 text-center text-xs leading-[1.5] text-neutral-500">
              계정이 없으신가요? <span className="text-primary-300">회원가입</span>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
};

export default AuthEntryView;
