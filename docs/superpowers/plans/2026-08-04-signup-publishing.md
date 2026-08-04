# Signup Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Figma 회원가입 UI를 현재 인증 진입 흐름에 추가하고, 코드 관련 문구를 초대 코드로 통일한다.

**Architecture:** 기존 `AuthEntryView`가 회원가입 화면 상태와 입력값을 추가로 관리한다. 화면 전환 규칙은 기존 `screen.mjs`에 두고, 보호자·복용자 분기의 종료 화면은 서버 요청 없이 UI 상태로만 렌더링한다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4

## Global Constraints

- 모바일 Figma 393px 프레임을 기준으로 한다.
- Figma의 인증 코드는 초대 코드로 표기한다.
- 새 의존성·회원가입 API·완료 화면은 추가하지 않는다.

---

### Task 1: 회원가입 전환 규칙과 테스트

**Files:**

- Modify: `tests/auth-entry-screen.test.mjs`
- Modify: `src/views/auth-entry/model/screen.mjs`

- [x] **Step 1: 다음 회원가입 흐름을 테스트에 추가한다**

```js
assert.equal(getNextScreen('start', 'open-signup'), 'signup-email');
assert.equal(getNextScreen('signup-email', 'next'), 'signup-password');
assert.equal(getNextScreen('signup-role', 'select-guardian'), 'signup-guardian');
assert.equal(getNextScreen('signup-role', 'select-patient'), 'signup-profile');
```

- [x] **Step 2: 테스트가 새 전환 규칙 없이 실패하는지 확인한다**

Run: `node --test tests/auth-entry-screen.test.mjs`

- [x] **Step 3: `getNextScreen`에 회원가입 전환을 최소 분기로 추가한다**

- [x] **Step 4: 테스트가 통과하는지 확인한다**

Run: `node --test tests/auth-entry-screen.test.mjs`

### Task 2: 회원가입 화면 구현

**Files:**

- Modify: `src/views/auth-entry/ui/AuthEntryView.tsx`

- [x] **Step 1: 이메일·비밀번호 확인·사용자 유형·보호자 초대 코드·복용자 정보·복용자 초대 코드 화면을 추가한다**

Use native email, password, number, and select controls. Guard each next action with required values.

- [x] **Step 2: 시작·로그인 화면의 회원가입 문구를 이메일 화면으로 연결한다**

- [x] **Step 3: 보호자 초대 코드 `123268`의 Clipboard API 복사를 구현한다**

- [x] **Step 4: Figma의 코드 관련 문구와 접근성 레이블을 초대 코드로 작성한다**

### Task 3: 검증과 커밋

**Files:**

- Modify: `docs/superpowers/plans/2026-08-04-signup-publishing.md`

- [x] **Step 1: FSD, 린트, 포맷, 빌드를 실행한다**

Run: `pnpm lint:fsd && pnpm lint && pnpm format:check && pnpm build`

- [x] **Step 2: 393px 브라우저에서 보호자·복용자 분기와 초대 코드 복사를 확인한다**

- [x] **Step 3: 작업을 논리적 커밋으로 기록하고 완료한 체크박스를 표시한다**
