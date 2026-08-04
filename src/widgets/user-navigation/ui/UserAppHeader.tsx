import Image from 'next/image';

const formatToday = () =>
  new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long' }).format(new Date());

const UserAppHeader = () => {
  const today = formatToday();

  return (
    <header className="flex items-center justify-between">
      <Image src="/medilink-logo.svg" alt="MediLink" width={100} height={18} priority />
      <time
        className="text-lg leading-[1.2] font-semibold text-neutral-700"
        suppressHydrationWarning
      >
        {today}
      </time>
    </header>
  );
};

export default UserAppHeader;
