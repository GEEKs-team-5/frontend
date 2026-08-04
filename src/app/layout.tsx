import localFont from 'next/font/local';

import type { Metadata } from 'next';

import Providers from './providers';

import './globals.css';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  weight: '45 920',
  display: 'swap',
  variable: '--font-pretendard',
});

export const metadata: Metadata = {
  title: 'MediLink',
  description: '복약 누락을 줄이고 보호자와의 돌봄 공백을 해소하는 복약 관리 서비스',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="ko" className={`font-sans ${pretendard.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
