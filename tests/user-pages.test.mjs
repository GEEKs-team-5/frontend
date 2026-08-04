import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

test('사용자 메인·리포트·설정 라우트를 제공한다', async () => {
  await Promise.all([
    access(new URL('../src/app/home/page.tsx', import.meta.url)),
    access(new URL('../src/app/report/page.tsx', import.meta.url)),
    access(new URL('../src/app/settings/page.tsx', import.meta.url)),
  ]);

  assert.ok(true);
});

test('리포트 약 목록에서 상세 팝업을 제공한다', async () => {
  const source = await readFile(
    new URL('../src/views/user-report/ui/UserReportView.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /role="dialog"/);
});

test('복약자 설정에는 보호자용 초대 코드 입력을 노출하지 않는다', async () => {
  const source = await readFile(
    new URL('../src/views/user-settings/ui/UserSettingsView.tsx', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(source, /초대 코드 재입력/);
  assert.doesNotMatch(source, /usePostAcceptInvitation/);
});

test('복약자 설정에서 토큰을 삭제하고 로그아웃할 수 있다', async () => {
  const source = await readFile(
    new URL('../src/views/user-settings/ui/UserSettingsView.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /deleteCookie\(COOKIE_KEYS\.ACCESS_TOKEN\)/);
  assert.match(source, /deleteCookie\(COOKIE_KEYS\.REFRESH_TOKEN\)/);
  assert.match(source, /로그아웃/);
});

test('약 등록 전 병용금기를 검사하고 확인 모달을 제공한다', async () => {
  const source = await readFile(
    new URL('../src/views/caregiver/ui/CaregiverView.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /getDrugSearch/);
  assert.match(source, /getDrugInteractions/);
  assert.match(source, /약물 상호작용 주의/);
});

test('Figma 기준 보호자 내비게이션과 리포트 표현을 제공한다', async () => {
  const [navigation, userReport, caregiver, homeIcon] = await Promise.all([
    readFile(
      new URL('../src/widgets/user-navigation/ui/UserBottomNav.tsx', import.meta.url),
      'utf8',
    ),
    readFile(new URL('../src/views/user-report/ui/UserReportView.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/caregiver/ui/CaregiverView.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../public/nav-home.svg', import.meta.url), 'utf8'),
  ]);

  assert.match(navigation, /href: '\/caregiver\/report'/);
  assert.doesNotMatch(navigation, /brightness-0 saturate-100/);
  assert.doesNotMatch(homeIcon, /#6EBAE5/);
  assert.match(userReport, /h-\[344px\]/);
  assert.doesNotMatch(caregiver, /DUR 검색·병용금기 확인/);
  assert.match(caregiver, /src="\/arrow-right\.svg"/);
});

test('넓은 모바일 화면에서 콘텐츠 폭을 확장한다', async () => {
  const [home, report, settings, caregiver, navigation] = await Promise.all([
    readFile(new URL('../src/views/user-home/ui/UserHomeView.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/user-report/ui/UserReportView.tsx', import.meta.url), 'utf8'),
    readFile(
      new URL('../src/views/user-settings/ui/UserSettingsView.tsx', import.meta.url),
      'utf8',
    ),
    readFile(new URL('../src/views/caregiver/ui/CaregiverView.tsx', import.meta.url), 'utf8'),
    readFile(
      new URL('../src/widgets/user-navigation/ui/UserBottomNav.tsx', import.meta.url),
      'utf8',
    ),
  ]);

  for (const source of [home, report, settings, caregiver, navigation]) {
    assert.match(source, /max-w-\[480px\]/);
  }
  assert.match(navigation, /min-\[430px\]:w-\[120px\]/);
  assert.match(caregiver, /max-w-\[440px\]/);
});
