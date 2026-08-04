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
