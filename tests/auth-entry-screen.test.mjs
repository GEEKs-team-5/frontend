import assert from 'node:assert/strict';
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
  assert.equal(getNextScreen('signup-role', 'select-guardian'), 'signup-guardian');
  assert.equal(getNextScreen('signup-role', 'select-patient'), 'signup-profile');
});
