import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('refresh token은 Swagger의 POST 계약으로 갱신한다', async () => {
  const [endpoints, client] = await Promise.all([
    readSource('../src/shared/api/endpoints.ts'),
    readSource('../src/shared/api/client.ts'),
  ]);

  assert.match(endpoints, /postRefresh: \(\) => 'api\/v1\/auth\/refresh'/);
  assert.match(client, /refreshAxiosInstance\.post\(authUrl\.postRefresh\(\),/);
  assert.match(client, /const \{ accessToken: newAccessToken, refreshToken: newRefreshToken \} = data;/);
});

test('로그인과 회원가입 응답의 refresh token을 저장한다', async () => {
  const source = await readSource('../src/features/auth/model/use-auth-mutations.ts');

  assert.equal((source.match(/setCookie\(COOKIE_KEYS\.REFRESH_TOKEN, refreshToken\)/g) ?? []).length, 2);
});

test('회원가입 요청과 응답 타입은 Swagger 계약을 따른다', async () => {
  const source = await readSource('../src/features/auth/model/types.ts');

  assert.match(source, /export type GenderType = 'MALE' \| 'FEMALE' \| 'OTHER' \| 'PREFER_NOT_TO_SAY';/);
  assert.match(source, /gender\?: GenderType;/);
  assert.match(source, /user: UserProfileResponseType;/);
});
