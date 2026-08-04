import Image from 'next/image';

const UserAppHeader = () => (
  <header className="flex items-center justify-between">
    <Image src="/medilink-logo.svg" alt="MediLink" width={100} height={18} priority />
    <time className="text-lg leading-[1.2] font-semibold text-neutral-700">2026년 08월 04일</time>
  </header>
);

export default UserAppHeader;
