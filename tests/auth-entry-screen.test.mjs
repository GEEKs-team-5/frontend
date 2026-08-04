import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

let getNextScreen;

try {
  ({ getNextScreen } = await import('../src/views/auth-entry/model/screen.mjs'));
} catch {
  getNextScreen = undefined;
}

test('인증 진입 화면 전환', () => {
  assert.equal(typeof getNextScreen, 'function');
  assert.equal(getNextScreen('splash', 'splash-timeout'), 'start');
  assert.equal(getNextScreen('start', 'open-signin'), 'signin');
  assert.equal(getNextScreen('signin', 'go-back'), 'start');
  assert.equal(getNextScreen('start', 'open-signup'), 'signup-email');
  assert.equal(getNextScreen('signup-email', 'next'), 'signup-password');
  assert.equal(getNextScreen('signup-role', 'select-guardian'), 'signup-invite');
  assert.equal(getNextScreen('signup-role', 'select-patient'), 'signup-profile');
  assert.equal(getNextScreen('signup-profile', 'register-patient'), 'signup-patient');
});

test('인증 완료 후 역할별 메인으로 이동', async () => {
  const source = await readFile(
    new URL('../src/views/auth-entry/ui/AuthEntryView.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /user\.activeRole === 'CAREGIVER' \? '\/caregiver' : '\/home'/);
  assert.equal((source.match(/router\.replace\('\/home'\)/g) ?? []).length, 1);
});

test('회원가입 단계 전환 시 화면을 상단 기준선으로 되돌린다', async () => {
  const source = await readFile(
    new URL('../src/views/auth-entry/ui/AuthEntryView.tsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /window\.scrollTo\(0, 0\)/);
});
