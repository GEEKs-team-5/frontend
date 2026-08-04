import type { MetadataRoute } from 'next';

const manifest = (): MetadataRoute.Manifest => ({
  name: 'MediLink',
  short_name: 'MediLink',
  description: '복약 누락을 줄이고 보호자와의 돌봄 공백을 해소하는 복약 관리 서비스',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#65BCEE',
  icons: [
    {
      src: '/icon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
    },
  ],
});

export default manifest;
