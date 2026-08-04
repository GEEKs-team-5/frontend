// ponytail: 복약 정보의 오래된 오프라인 캐시는 위험하다. 화면별 동기화 정책이 정해지면 추가한다.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
