import assert from 'node:assert/strict';
import test from 'node:test';

const { getSignupValidationMessage } = await import('../src/features/auth/model/schema.ts');

test('회원가입 단계별 잘못된 입력을 차단', () => {
  assert.equal(
    getSignupValidationMessage('email', { email: 'invalid' }),
    '올바른 이메일을 입력해주세요.',
  );
  assert.equal(
    getSignupValidationMessage('password', {
      password: 'short',
      passwordConfirmation: 'short',
    }),
    '비밀번호는 8자 이상 입력해주세요.',
  );
  assert.equal(
    getSignupValidationMessage('password', {
      password: 'Password123!',
      passwordConfirmation: 'different',
    }),
    '비밀번호가 일치하지 않습니다.',
  );
  assert.equal(
    getSignupValidationMessage('invite', { inviteCode: '123' }),
    '6자리 초대 코드를 입력해주세요.',
  );
});
