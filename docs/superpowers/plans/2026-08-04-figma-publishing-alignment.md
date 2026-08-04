# Figma 퍼블리싱 정합화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Figma 모바일 화면과 다른 현재 퍼블리싱을 최소 코드로 정렬한다.

**Architecture:** 기존 뷰의 책임은 유지한다. 공통 내비게이션은 경로만으로 보호자/복용자 링크와 활성 상태를 결정하고, 나머지는 해당 뷰의 정적 클래스와 화면 전환만 조정한다.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, node:test

## Global Constraints

- Figma 기준 화면은 393 × 852px이며 기기 상태 바와 키보드 목업은 구현하지 않는다.
- 새 의존성, 범용 UI 컴포넌트, API 계약 변경을 추가하지 않는다.
- 컴포넌트는 기존 FSD 레이어와 default export 관례를 유지한다.

---

### Task 1: 보호자 내비게이션 정렬

**Files:**

- Modify: `src/widgets/user-navigation/ui/UserBottomNav.tsx`
- Test: `tests/user-pages.test.mjs`

- [ ] Failing test에 `/caregiver/report`가 보호자 리포트 링크와 활성 상태를 사용해야 한다는 소스 계약을 추가한다.
- [ ] 테스트가 현재 복용자 링크만 가진 구현에서 실패하는지 실행한다.
- [ ] `pathname.startsWith('/caregiver')`일 때 `/caregiver`, `/caregiver/report`, `/caregiver/settings`을 사용하는 최소 배열을 추가한다.
- [ ] 테스트를 다시 실행한다.

### Task 2: 화면별 Figma 치수 정렬

**Files:**

- Modify: `src/views/user-report/ui/UserReportView.tsx`
- Modify: `src/views/caregiver/ui/CaregiverView.tsx`
- Test: `tests/user-pages.test.mjs`

- [ ] Failing test에 월간 차트 `h-[344px]`, 보호자 리포트의 우측 화살표, 약 등록 폼의 임시 DUR 버튼 제거를 명시한다.
- [ ] 테스트가 현재 코드에서 실패하는지 실행한다.
- [ ] 차트 높이를 Figma 값으로 수정하고, 보호자 일간 카드에 Figma와 같은 89px 버튼/화살표를 적용하며, CTA와 겹치는 DUR 버튼을 제거한다.
- [ ] 테스트를 다시 실행한다.

### Task 3: 회원가입 단계 기준선 유지

**Files:**

- Modify: `src/views/auth-entry/ui/AuthEntryView.tsx`
- Test: `tests/auth-entry-screen.test.mjs`

- [ ] Failing test에 화면 상태가 변할 때 `window.scrollTo(0, 0)`를 호출하는 효과가 있어야 한다는 계약을 추가한다.
- [ ] 테스트가 현재 코드에서 실패하는지 실행한다.
- [ ] `screen` 변화에만 반응하는 최소 `useEffect`를 추가한다.
- [ ] 관련 테스트를 다시 실행한다.

### Task 4: 검증

**Files:**

- Verify only

- [ ] `pnpm lint:fsd`, `pnpm lint`, `pnpm format:check`를 실행한다.
- [ ] 393 × 852 브라우저에서 `/`, `/signin`, `/signup`, `/home`, `/report`, `/settings`, 보호자 6개 경로를 캡처한다.
- [ ] Figma 대표 프레임과 재대조하고 콘솔 오류를 확인한다.
