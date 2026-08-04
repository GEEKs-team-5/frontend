import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('사용자 화면은 프로필과 오늘 복약 API를 사용한다', async () => {
  const [userApi, doseApi] = await Promise.all([
    readFile(new URL('../src/entities/user/api/user.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/entities/dose/api/dose.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(userApi, /'api\/v1\/users\/me'/);
  assert.match(doseApi, /`api\/v1\/patients\/\$\{patientId\}\/doses\/today`/);
  assert.match(doseApi, /`api\/v1\/doses\/\$\{occurrenceId\}\/taken`/);
  assert.match(doseApi, /`api\/v1\/patients\/\$\{patientId\}\/adherence\/weekly`/);
  assert.match(
    doseApi,
    /`api\/v1\/patients\/\$\{patientId\}\/adherence\/monthly-by-weekday\?month=\$\{month\}`/,
  );
});

test('메인·리포트·설정 화면은 사용자 API 훅을 소비한다', async () => {
  const [home, report, settings] = await Promise.all([
    readFile(new URL('../src/views/user-home/ui/UserHomeView.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/user-report/ui/UserReportView.tsx', import.meta.url), 'utf8'),
    readFile(
      new URL('../src/views/user-settings/ui/UserSettingsView.tsx', import.meta.url),
      'utf8',
    ),
  ]);

  assert.match(home, /useGetTodayDoses/);
  assert.match(report, /useGetMonthlyWeekdayAdherence/);
  assert.doesNotMatch(report, /useGetWeeklyAdherence/);
  assert.match(settings, /usePatchUserProfile/);
});
