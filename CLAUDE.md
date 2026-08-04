# MediLink

복약 누락을 줄이고 보호자와의 돌봄 공백을 해소하는 복약 관리 서비스. 단일 Next.js 앱에 Feature-Sliced Design(FSD)을 적용한다.

## 기술 스택

pnpm / Next.js 16(App Router, React Compiler) / React 19 / TypeScript / Tailwind CSS 4 / TanStack Query v5 / axios / React Hook Form + zod

## 프로젝트 구조

```
src/
├── app/       Next 라우팅, layout, metadata, Provider
├── views/     페이지 조합(FSD pages 역할)
├── widgets/   재사용 페이지 섹션
├── features/  사용자 액션과 폼
├── entities/  도메인 엔티티
└── shared/    API 클라이언트, 설정, 공통 유틸
```

세그먼트는 필요할 때만 `ui/`, `model/`, `api/`, `lib/`를 사용한다. 단일 파일에만 쓰이는 코드에 세그먼트나 배럴을 미리 만들지 않는다.

## FSD 의존성

- `app → views → widgets → features → entities → shared` 방향으로만 import한다.
- 같은 레이어의 서로 다른 슬라이스 import는 금지한다.
- `app`과 `shared` 내부 세그먼트끼리는 import할 수 있다.
- `@/*`는 `src/*`를 가리킨다. 외부에서 슬라이스를 사용할 때는 해당 슬라이스의 `index.ts`를 우선한다.
- 레이어 규칙은 `scripts/check-fsd-dependencies.mjs`가 검사한다. `views`는 이 프로젝트에서 `pages` 대신 쓰는 레이어다.

## 코드 규칙

- TypeScript strict를 유지한다. 객체 구조는 `interface`, 단순 유니온은 `type`을 사용한다.
- 컴포넌트는 PascalCase 파일명, 화살표 함수, `default export`를 사용한다. props는 `...Props`로 이름 짓는다.
- 폴더와 일반 파일은 kebab-case 또는 기존 슬라이스 관례를 따른다. 함수·변수는 camelCase, 타입은 PascalCase다.
- `enum` 대신 유니온과 `as const` 객체를 사용한다.
- import 정렬은 ESLint `simple-import-sort` 규칙을 따른다. 직접 수동 정렬하지 말고 린트 자동 수정을 사용한다.
- 스타일은 Tailwind 클래스를 사용한다. 이미 설치된 `clsx`와 `tailwind-merge`가 필요한 경우에만 조합 유틸을 만든다.

## API와 서버 경계

- 브라우저 API는 `@/shared`의 `axiosInstance`와 `get`, `post`, `put`, `patch`, `del`을 사용한다. 클라이언트 base URL은 `/api`다.
- 서버 컴포넌트·Server Action에서는 `@/shared/index.server`의 `serverAxiosInstance`만 사용한다. 이 모듈은 `server-only`로 보호된다.
- 브라우저 클라이언트는 access token 만료 시 refresh API를 한 번 호출하고, 실패하면 토큰을 지운 뒤 `/signin`으로 이동한다. 서버에서는 토큰을 갱신하지 않는다.
- `NEXT_PUBLIC_API_BASE_URL`은 API 서버 origin이다. `.env.local`에 설정하며, `next.config.ts`의 `/api/:path*` rewrite와 서버 Axios가 사용한다.
- 응답 인터셉터가 `response.data`를 반환하므로 일반 요청에는 메서드 래퍼를 우선 사용한다.

## 검증

변경 범위에 맞춰 실행한다.

```bash
pnpm lint
pnpm exec tsc --noEmit
node scripts/check-fsd-dependencies.mjs
pnpm build
```

`pnpm build`에는 `NEXT_PUBLIC_API_BASE_URL`이 필요하다. 전체 FSD 검사에는 `pnpm lint:fsd`를 사용한다.
