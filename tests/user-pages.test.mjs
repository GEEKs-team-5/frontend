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

test('보호자 설정에서 초대 코드를 재입력해 연결할 수 있다', async () => {
  const source = await readFile(
    new URL('../src/views/caregiver/ui/CaregiverView.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /usePostAcceptInvitation/);
  assert.match(source, /초대 코드 재입력/);
  assert.match(source, /postAcceptInvitationMutation\.mutate/);
  assert.doesNotMatch(source, /초대 코드 복사하기/);
});

test('보호자 설정에서 토큰을 삭제하고 로그아웃할 수 있다', async () => {
  const source = await readFile(
    new URL('../src/views/caregiver/ui/CaregiverView.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /deleteCookie\(COOKIE_KEYS\.ACCESS_TOKEN\)/);
  assert.match(source, /deleteCookie\(COOKIE_KEYS\.REFRESH_TOKEN\)/);
  assert.match(source, /router\.replace\('\/signin'\)/);
  assert.match(source, /로그아웃/);
});

test('보호자 메인에서 약 선택 화면을 거쳐 직접 등록 화면으로 이동한다', async () => {
  const source = await readFile(
    new URL('../src/views/caregiver/ui/CaregiverView.tsx', import.meta.url),
    'utf8',
  );

  assert.match(
    source,
    /href=\{screen === 'main' \? '\/caregiver\/medications' : '\/caregiver\/medications\/new'\}/,
  );
});

test('보호자 약 선택 화면에서 검색어를 제출하면 의약품 API 결과를 표시한다', async () => {
  const source = await readFile(
    new URL('../src/views/caregiver/ui/CaregiverView.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /getDrugSearch\(search\.trim\(\)\)/);
  assert.match(source, /drugCandidates\?\.map/);
  assert.match(source, /onSubmit=\{\(event\) => \{\s*event\.preventDefault\(\);\s*onSearch\(\);/);
});

test('보호자 약 선택 결과를 누르면 약 상세 선택 모달을 연다', async () => {
  const source = await readFile(
    new URL('../src/views/caregiver/ui/CaregiverView.tsx', import.meta.url),
    'utf8',
  );

  assert.match(
    source,
    /const \[selectedDrug, setSelectedDrug\] = useState<DrugType \| null>\(null\)/,
  );
  assert.match(source, /onOpen=\{setSelectedDrug\}/);
  assert.match(source, /<DrugSelectionDetailDialog/);
  assert.match(source, /이 약 선택하기/);
});

test('보호자 약 등록은 KST 기준 시작일을 전송한다', async () => {
  const source = await readFile(
    new URL('../src/views/caregiver/ui/CaregiverView.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /new Intl\.DateTimeFormat\('sv-SE', \{ timeZone: 'Asia\/Seoul' \}\)/);
  assert.doesNotMatch(source, /startDate: new Date\(\)\.toISOString\(\)\.slice\(0, 10\)/);
});

test('보호자 약 등록은 요일을 0부터 6까지의 정수 배열로 전송한다', async () => {
  const [caregiver, medicationApi] = await Promise.all([
    readFile(new URL('../src/views/caregiver/ui/CaregiverView.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/entities/medication/api/medication.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(caregiver, /daysOfWeek: \[0, 1, 2, 3, 4, 5, 6\]/);
  assert.match(medicationApi, /daysOfWeek: number\[\];/);
});

test('보호자 약 등록이 성공하면 메인 약 목록으로 이동한다', async () => {
  const source = await readFile(
    new URL('../src/views/caregiver/ui/CaregiverView.tsx', import.meta.url),
    'utf8',
  );

  assert.match(
    source,
    /postMedication\.mutate\([\s\S]*onSuccess: \(\) => router\.replace\('\/caregiver'\)/,
  );
});

test('보호자 리포트에서 기간을 전환하고 약 상세를 연다', async () => {
  const source = await readFile(
    new URL('../src/views/caregiver/ui/CaregiverView.tsx', import.meta.url),
    'utf8',
  );

  assert.match(
    source,
    /const \[reportType, setReportType\] = useState<'daily' \| 'monthly'>\('daily'\)/,
  );
  assert.match(source, /onClick=\{\(\) => setReportType\('monthly'\)\}/);
  assert.match(source, /onClick=\{\(\) => setSelectedDose\(dose\)\}/);
  assert.match(source, /<CaregiverMedicationDetailDialog/);
});

test('보호자 월간 리포트의 요약 아이콘은 정사각형으로 고정한다', async () => {
  const [caregiver, userReport] = await Promise.all([
    readFile(new URL('../src/views/caregiver/ui/CaregiverView.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/views/user-report/ui/UserReportView.tsx', import.meta.url), 'utf8'),
  ]);

  for (const source of [caregiver, userReport]) {
    assert.match(source, /className="size-6 shrink-0"\s+src="\/report-rate\.svg"/);
    assert.match(source, /className="size-6 shrink-0"\s+src="\/report-count\.svg"/);
  }
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
