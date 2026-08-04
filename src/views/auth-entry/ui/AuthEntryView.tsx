'use client';

import { type FormEvent, useEffect, useState } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import {
  getSignupValidationMessage,
  LoginSchema,
  RegisterSchema,
  usePostAcceptInvitation,
  usePostCareInvitation,
  usePostLogin,
  usePostRegister,
} from '@/features/auth';

import { getNextScreen } from '../model/screen.mjs';

type ScreenType =
  | 'splash'
  | 'start'
  | 'signin'
  | 'signup-email'
  | 'signup-password'
  | 'signup-role'
  | 'signup-patient'
  | 'signup-profile'
  | 'signup-invite';

type RoleType = '' | 'guardian' | 'patient';
type GenderType = '' | 'female' | 'male';

interface AuthEntryViewProps {
  initialScreen?: ScreenType;
}

const AuthEntryView = ({ initialScreen = 'splash' }: AuthEntryViewProps) => {
  const router = useRouter();
  const [screen, setScreen] = useState<ScreenType>(initialScreen);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [role, setRole] = useState<RoleType>('');
  const [isRoleOptionsOpen, setIsRoleOptionsOpen] = useState<boolean>(false);
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<GenderType>('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [invitationCode, setInvitationCode] = useState<string>('');
  const [isCodeCopied, setIsCodeCopied] = useState<boolean>(false);
  const [signupMessage, setSignupMessage] = useState<string>('');
  const [signInEmail, setSignInEmail] = useState<string>('');
  const [signInPassword, setSignInPassword] = useState<string>('');
  const [signInMessage, setSignInMessage] = useState<string>('');
  const postLoginMutation = usePostLogin();
  const postRegisterMutation = usePostRegister();
  const postCareInvitationMutation = usePostCareInvitation();
  const postAcceptInvitationMutation = usePostAcceptInvitation();

  const handleOpenSignIn = () => router.push('/signin');

  const handleOpenSignUp = () => router.push('/signup');

  const handleGoBack = () => {
    if (screen === 'signin' || screen === 'signup-email') {
      router.push('/');
      return;
    }

    setScreen(getNextScreen(screen, 'go-back'));
  };

  const handleSignUpNext = async () => {
    setSignupMessage('');

    const signupStep = screen.replace('signup-', '') as 'email' | 'password' | 'profile' | 'role';
    const validationMessage = getSignupValidationMessage(signupStep, {
      age,
      email,
      gender,
      password,
      passwordConfirmation,
      role,
    });

    if (validationMessage) {
      setSignupMessage(validationMessage);
      return;
    }

    if (screen === 'signup-email') {
      setScreen(getNextScreen(screen, 'next'));
      return;
    }
    if (screen === 'signup-password') {
      setScreen(getNextScreen(screen, 'next'));
      return;
    }
    if (screen === 'signup-role') {
      setScreen(getNextScreen(screen, role === 'guardian' ? 'select-guardian' : 'select-patient'));
      return;
    }
    if (screen !== 'signup-profile') return;

    const registerResult = RegisterSchema.safeParse({
      age,
      email,
      gender: gender === 'female' ? 'FEMALE' : gender === 'male' ? 'MALE' : undefined,
      password,
      role: role === 'patient' ? 'PATIENT' : role === 'guardian' ? 'CAREGIVER' : undefined,
    });

    if (!registerResult.success) {
      setSignupMessage(registerResult.error.issues[0]?.message ?? '입력값을 확인해주세요.');
      return;
    }

    try {
      await postRegisterMutation.mutateAsync(registerResult.data);

      if (registerResult.data.role === 'PATIENT') {
        const invitation = await postCareInvitationMutation.mutateAsync();
        setInvitationCode(invitation.code);
        setScreen(getNextScreen(screen, 'register-patient'));
        return;
      }

      setScreen(getNextScreen(screen, 'register-guardian'));
    } catch {
      setSignupMessage('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleCopyInviteCode = async () => {
    if (!navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(invitationCode);
      setIsCodeCopied(true);
    } catch {
      setSignupMessage('초대 코드를 복사하지 못했습니다.');
    }
  };

  const handleAcceptInvitation = async () => {
    const validationMessage = getSignupValidationMessage('invite', { inviteCode });
    if (validationMessage) {
      setSignupMessage(validationMessage);
      return;
    }

    try {
      await postAcceptInvitationMutation.mutateAsync(inviteCode.trim());
      router.replace('/home');
    } catch {
      setSignupMessage('초대 코드를 확인해주세요.');
    }
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignInMessage('');

    const loginResult = LoginSchema.safeParse({ email: signInEmail, password: signInPassword });
    if (!loginResult.success) {
      setSignInMessage(loginResult.error.issues[0]?.message ?? '입력값을 확인해주세요.');
      return;
    }

    try {
      await postLoginMutation.mutateAsync(loginResult.data);
      router.replace('/home');
    } catch {
      setSignInMessage('이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  const handleTogglePasswordVisibility = () => setIsPasswordVisible((visible) => !visible);

  const handleSelectRole = (selectedRole: Exclude<RoleType, ''>) => {
    setRole(selectedRole);
    setIsRoleOptionsOpen(false);
  };

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
            onClick={handleOpenSignUp}
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

  if (screen.startsWith('signup')) {
    const title =
      screen === 'signup-email'
        ? '이메일을\n입력해주세요'
        : screen === 'signup-password'
          ? '비밀번호를\n입력해주세요'
          : screen === 'signup-role'
            ? '사용자 유형을\n알려주세요'
            : screen === 'signup-patient'
              ? '초대 코드를 보호자에게\n공유해주세요.'
              : screen === 'signup-profile'
                ? '나이와 성별을\n알려주세요'
                : '복용자가 보내준\n초대 코드를 적어주세요';

    return (
      <main className="bg-neutral-0 flex min-h-dvh flex-col px-5 pt-[52px]">
        <button
          className="text-neutral-1000 -ml-1 flex size-8 items-center justify-center text-2xl leading-none"
          type="button"
          aria-label="이전 화면으로 돌아가기"
          onClick={handleGoBack}
        >
          ‹
        </button>
        <section className="mt-3 flex flex-1 flex-col">
          <h1 className="text-[32px] leading-[1.2] font-semibold whitespace-pre-line text-neutral-800">
            {title}
          </h1>
          <div className="mt-8 space-y-4">
            {screen === 'signup-email' && (
              <input
                className="focus:ring-primary-300 h-12 w-full rounded-md bg-neutral-100 px-4 text-base text-neutral-800 outline-none placeholder:text-neutral-500 focus:ring-1"
                type="email"
                value={email}
                placeholder="이메일을 입력해주세요."
                aria-label="회원가입 이메일"
                onChange={(event) => setEmail(event.target.value)}
              />
            )}
            {screen === 'signup-password' && (
              <>
                <input
                  className="focus:ring-primary-300 h-12 w-full rounded-md bg-neutral-100 px-4 text-base text-neutral-800 outline-none placeholder:text-neutral-500 focus:ring-1"
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={password}
                  placeholder="비밀번호를 입력해주세요."
                  aria-label="회원가입 비밀번호"
                  onChange={(event) => setPassword(event.target.value)}
                />
                <div className="relative">
                  <input
                    className="focus:ring-primary-300 h-12 w-full rounded-md bg-neutral-100 py-0 pr-12 pl-4 text-base text-neutral-800 outline-none placeholder:text-neutral-500 focus:ring-1"
                    type={isPasswordVisible ? 'text' : 'password'}
                    value={passwordConfirmation}
                    placeholder="비밀번호를 한번 더 입력해주세요."
                    aria-label="비밀번호 확인"
                    onChange={(event) => setPasswordConfirmation(event.target.value)}
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
              </>
            )}
            {screen === 'signup-role' && (
              <div className="space-y-[6px]">
                <button
                  className="flex h-12 w-full items-center justify-between rounded-md border border-neutral-300 px-4 text-left text-base text-neutral-800"
                  type="button"
                  aria-label="사용자 유형"
                  aria-expanded={isRoleOptionsOpen}
                  onClick={() => setIsRoleOptionsOpen((isOpen) => !isOpen)}
                >
                  {role === 'guardian' ? '보호자' : role === 'patient' ? '복용자' : '선택해주세요'}
                  <span aria-hidden="true">{isRoleOptionsOpen ? '⌃' : '⌄'}</span>
                </button>
                {isRoleOptionsOpen && (
                  <>
                    <button
                      className="flex h-12 w-full items-center rounded-md border border-neutral-300 px-4 text-left text-base text-neutral-800"
                      type="button"
                      onClick={() => handleSelectRole('guardian')}
                    >
                      보호자
                    </button>
                    <button
                      className="flex h-12 w-full items-center rounded-md border border-neutral-300 px-4 text-left text-base text-neutral-800"
                      type="button"
                      onClick={() => handleSelectRole('patient')}
                    >
                      복용자
                    </button>
                  </>
                )}
              </div>
            )}
            {screen === 'signup-patient' && (
              <>
                <button
                  className="flex h-[58px] w-full items-center justify-center gap-[6px] rounded-md border border-dashed border-neutral-500 text-[32px] font-semibold text-neutral-800"
                  type="button"
                  onClick={() => void handleCopyInviteCode()}
                >
                  <Image src="/auth-copy.svg" alt="" width={16} height={19} />
                  {invitationCode}
                </button>
                <p className="text-sm text-neutral-500">
                  {isCodeCopied
                    ? '초대 코드가 복사되었습니다.'
                    : '초대 코드는 언제든 마이페이지에서 확인 가능합니다.'}
                </p>
              </>
            )}
            {screen === 'signup-profile' && (
              <>
                <input
                  className="focus:ring-primary-300 h-12 w-full rounded-md bg-neutral-100 px-4 text-base text-neutral-800 outline-none placeholder:text-neutral-500 focus:ring-1"
                  type="number"
                  value={age}
                  placeholder="나이를 입력해주세요."
                  aria-label="나이"
                  onChange={(event) => setAge(event.target.value)}
                />
                <select
                  className="bg-neutral-0 h-12 w-full rounded-md border border-neutral-300 px-4 text-base text-neutral-800 outline-none"
                  value={gender}
                  aria-label="성별"
                  onChange={(event) => setGender(event.target.value as GenderType)}
                >
                  <option value="">성별을 선택해주세요</option>
                  <option value="female">여성</option>
                  <option value="male">남성</option>
                </select>
              </>
            )}
            {screen === 'signup-invite' && (
              <input
                className="focus:ring-primary-300 h-12 w-full rounded-md bg-neutral-100 px-4 text-base text-neutral-800 outline-none placeholder:text-neutral-500 focus:ring-1"
                value={inviteCode}
                placeholder="초대 코드를 입력해주세요."
                aria-label="초대 코드"
                onChange={(event) => setInviteCode(event.target.value)}
              />
            )}
          </div>
          {signupMessage && <p className="text-sm text-neutral-500">{signupMessage}</p>}
          <button
            className="bg-primary-300 text-neutral-0 mt-auto mb-[28px] h-12 rounded-md text-base font-semibold"
            type="button"
            onClick={
              screen === 'signup-invite'
                ? () => void handleAcceptInvitation()
                : screen === 'signup-patient'
                  ? () => router.replace('/home')
                  : () => void handleSignUpNext()
            }
            disabled={postRegisterMutation.isPending || postAcceptInvitationMutation.isPending}
          >
            {screen === 'signup-patient' ? '완료' : screen === 'signup-invite' ? '회원가입' : '다음 >'}
          </button>
        </section>
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
        <form className="mt-8 flex flex-col gap-4" onSubmit={(event) => void handleSignIn(event)}>
          <input
            className="focus:ring-primary-300 h-12 w-full rounded-md bg-neutral-100 px-4 text-base text-neutral-800 outline-none placeholder:text-neutral-500 focus:ring-1"
            type="email"
            value={signInEmail}
            placeholder="이메일을 입력해주세요."
            aria-label="이메일"
            onChange={(event) => setSignInEmail(event.target.value)}
          />
          <div className="relative">
            <input
              className="focus:ring-primary-300 h-12 w-full rounded-md bg-neutral-100 py-0 pr-12 pl-4 text-base text-neutral-800 outline-none placeholder:text-neutral-500 focus:ring-1"
              type={isPasswordVisible ? 'text' : 'password'}
              value={signInPassword}
              placeholder="비밀번호를 입력해주세요."
              aria-label="비밀번호"
              onChange={(event) => setSignInPassword(event.target.value)}
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
              disabled={postLoginMutation.isPending}
            >
              로그인
            </button>
            {signInMessage && (
              <p className="text-center text-sm text-neutral-500">{signInMessage}</p>
            )}
            <p className="mt-1 text-center text-xs leading-[1.5] text-neutral-500">
              계정이 없으신가요?{' '}
              <button className="text-primary-300" type="button" onClick={handleOpenSignUp}>
                회원가입
              </button>
            </p>
          </div>
        </form>
      </section>
    </main>
  );
};

export default AuthEntryView;
