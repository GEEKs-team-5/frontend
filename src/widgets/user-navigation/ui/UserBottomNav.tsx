'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const userNavigationItems = [
  { href: '/home', icon: '/nav-home.svg', label: '메인페이지' },
  { href: '/report', icon: '/nav-report.svg', label: '리포트' },
  { href: '/settings', icon: '/nav-settings.svg', label: '설정' },
] as const;

const caregiverNavigationItems = [
  { href: '/caregiver', icon: '/nav-home.svg', label: '메인페이지' },
  { href: '/caregiver/report', icon: '/nav-report.svg', label: '리포트' },
  { href: '/caregiver/settings', icon: '/nav-settings.svg', label: '설정' },
] as const;

const UserBottomNav = () => {
  const pathname = usePathname();
  const isCaregiver = pathname.startsWith('/caregiver');
  const navigationItems = isCaregiver ? caregiverNavigationItems : userNavigationItems;

  return (
    <nav className="bg-neutral-0 fixed inset-x-0 bottom-0 z-10 mx-auto flex h-[95px] max-w-[393px] items-start justify-center border border-neutral-200 pt-3">
      {navigationItems.map(({ href, icon, label }) => {
        const isActive =
          pathname === href ||
          (href === '/caregiver' && pathname.startsWith('/caregiver/medications'));

        return (
          <Link
            className={`flex h-12 w-[100px] flex-col items-center rounded-full text-sm leading-5 font-semibold ${isActive ? 'bg-primary-50 text-primary-300' : 'text-neutral-600'}`}
            href={href}
            key={href}
          >
            <Image
              className={isActive && href !== '/home' ? 'brightness-0 saturate-100' : ''}
              src={icon}
              alt=""
              width={24}
              height={24}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default UserBottomNav;
