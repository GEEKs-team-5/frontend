# Auth Entry Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Figma의 스플래시·시작·로그인 화면을 모바일 PWA에서 동작하는 인증 진입 흐름으로 구현한다.

**Architecture:** `src/views/auth-entry`의 단일 클라이언트 뷰가 `splash`, `start`, `signin` 화면 상태와 입력값을 소유한다. `src/app/page.tsx`는 이 뷰만 조합하며, 회원가입과 서버 인증 API는 범위 밖으로 남긴다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4

## Global Constraints

- 기준 화면 폭은 Figma의 393px 모바일 프레임이며, 데스크톱 전용 UI를 만들지 않는다.
- iOS 상태바·홈 인디케이터·키보드는 기기 목업으로 구현하지 않는다.
- Figma MediLink 로고는 제공된 에셋을 정적 파일로 저장해 사용한다.
- 새 의존성·공용 UI 라이브러리·회원가입·인증 API를 추가하지 않는다.

---

### Task 1: Figma 로고와 모바일 전역 스타일 연결

**Files:**

- Create: `public/medilink-logo.svg`
- Modify: `src/app/globals.css`

**Interfaces:**

- Consumes: Figma 스플래시·시작·로그인 화면의 `MediLink` 로고 에셋
- Produces: `font-sans`가 Pretendard를 사용하고, 인증 화면이 사용할 수 있는 모바일 기본 배경·문자색

- [x] **Step 1: 스플래시 화면을 기준으로 로고와 기본 폰트를 확인한다**

Run: `pnpm dev`

Expected: 현재 홈 화면에는 로고와 인증 화면이 없다.

- [x] **Step 2: Figma 로고 에셋을 `public/medilink-logo.svg`로 저장한다**

Use the exact Figma-exported asset bytes; do not recreate the SVG path.

- [x] **Step 3: `src/app/globals.css`에서 `--font-sans`를 `--font-pretendard`에 연결하고 body의 흰 배경과 neutral-800 문자색을 설정한다**

```css
@theme inline {
  --font-sans: var(--font-pretendard);
}

body {
  background: var(--color-neutral-0);
  color: var(--color-neutral-800);
}
```

- [x] **Step 4: 변경 파일을 확인하고 커밋한다**

```bash
git add public/medilink-logo.svg src/app/globals.css
git commit -m "update(app): 인증 진입 화면 전역 스타일 반영"
```

### Task 2: 인증 진입 화면과 전환 구현

**Files:**

- Create: `src/views/auth-entry/ui/AuthEntryView.tsx`
- Create: `src/views/auth-entry/index.ts`
- Modify: `src/app/page.tsx`
- Delete: `src/views/home/index.ts`
- Delete: `src/views/home/ui/HomeView.tsx`

**Interfaces:**

- Consumes: `/medilink-logo.svg`, Tailwind 색상 토큰
- Produces: 기본 export `AuthEntryView`, 세 화면의 클라이언트 전환 UI

- [x] **Step 1: 인증 진입 흐름의 기대 동작을 브라우저에서 기록한다**

Expected behavior:

```text
splash --1초--> start
start --로그인--> signin
signin --뒤로--> start
signin --눈 아이콘--> password/text 전환
```

- [x] **Step 2: `AuthEntryView`를 `'use client'` 컴포넌트로 작성한다**

```ts
type ScreenType = 'splash' | 'start' | 'signin';

const [screen, setScreen] = useState<ScreenType>('splash');
const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
```

Use a `useEffect` cleanup-safe timeout to move from `splash` to `start` after 1000ms. Use native `button`, `input type="email"`, and `input type="password"`/`text`; both form submit and 회원가입 버튼 have no server action.

- [x] **Step 3: Figma 치수에 맞춰 세 상태를 렌더링한다**

Use 20px horizontal padding, 353px-wide full-width controls, 48px button/input height, `primary-300` filled buttons, and the Figma Korean copy. Do not render platform chrome or keyboard.

- [x] **Step 4: `src/app/page.tsx`가 `AuthEntryView`를 렌더링하게 바꾸고 기존 home 뷰를 삭제한다**

```tsx
import { AuthEntryView } from '@/views/auth-entry';

export default AuthEntryView;
```

- [x] **Step 5: 개발 서버에서 전환 동작을 확인한다**

Check: 1초 뒤 시작 화면, 로그인 버튼, 뒤로 버튼, 비밀번호 표시 전환, 393px 폭에서 수평 스크롤 없음.

- [x] **Step 6: 변경 파일을 확인하고 커밋한다**

```bash
git add src/app/page.tsx src/views/auth-entry
git rm src/views/home/index.ts src/views/home/ui/HomeView.tsx
git commit -m "add(auth): 인증 진입 화면 퍼블리싱"
```

### Task 3: 정적·시각 검증

**Files:**

- Modify: none

**Interfaces:**

- Consumes: Task 1과 Task 2의 구현
- Produces: FSD, 타입, 포맷, 빌드, 모바일 동작 검증 결과

- [x] **Step 1: FSD와 린트를 실행한다**

Run: `pnpm lint:fsd && pnpm lint`

Expected: exit code 0.

- [x] **Step 2: 포맷과 프로덕션 빌드를 실행한다**

Run: `pnpm format:check && pnpm build`

Expected: 포맷 오류가 있으면 이번 변경 파일만 포맷한 뒤 재실행하고, build exit code 0.

- [x] **Step 3: 모바일 브라우저에서 Figma와 대조한다**

Check: 로고 위치, 20px 화면 여백, 48px 컨트롤 높이, 브랜드색, 입력 포커스 시 네이티브 키보드, 세 화면 전환.
