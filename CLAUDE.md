# MediLink

복약 누락을 줄이고 보호자와의 돌봄 공백을 해소하는 복약 관리 서비스. **단일 Next.js 앱**에 Feature-Sliced Design(FSD)을 적용한다.

## 스택

pnpm / Next.js 16(App Router, React Compiler) / React 19 / TypeScript / Tailwind CSS 4 / TanStack Query v5 / axios / React Hook Form + zod v4

## 프로젝트 구조

```
src/
├── app/       Next 라우팅, layout, metadata, Provider (FSD app 겸용)
├── views/     페이지 조합 (FSD pages — Next과 충돌해 개명)
├── widgets/   재사용 페이지 섹션
├── features/  유저 액션 (폼, 뮤테이션)
├── entities/  도메인 엔티티
└── shared/    api client·server, 메서드 래퍼, 쿠키, config, 공통 유틸
```

- 단일 앱이므로 앱·패키지 간 import 경계는 없다. 공통 코드는 필요할 때만 `src/shared`에 둔다.
- 세그먼트는 `ui/` 컴포넌트 · `model/` 타입·훅·스키마·상수 · `api/` fetch 함수 · `lib/` 슬라이스 전용 유틸을 사용한다.
- 단일 파일에만 쓰이는 코드에는 세그먼트나 배럴을 미리 만들지 않는다.
- 도메인 UI(JobCard 등)는 해당 엔티티 또는 기능 슬라이스의 `ui/`에 둔다. 범용 primitive가 필요해질 때까지 별도 디자인 시스템을 만들지 않는다.

## 아키텍처 — Feature-Sliced Design (레이어 분리)

```
app → views → widgets → features → entities → shared
```

- 위에서 아래 방향으로만 import한다.
- 같은 레이어의 다른 슬라이스 import는 금지한다.
- `app`·`shared`는 레이어이자 슬라이스이므로 내부 세그먼트끼리 import할 수 있다.
- `views`는 Next.js의 `pages` 디렉터리와 이름이 충돌해 FSD `pages` 대신 사용한다.
- `@/*`는 `src/*`를 가리키며, 앱 내부 코드에서만 사용한다.
- 외부 슬라이스를 소비할 때는 해당 슬라이스의 `index.ts`를 우선한다. 단일 파일 전용 코드에는 공개 API를 만들지 않는다.

## 네이밍

| 구분                  | 규칙                                | 예시                                          |
| --------------------- | ----------------------------------- | --------------------------------------------- |
| 슬라이스 폴더         | kebab-case                          | `medication-schedule/`, `care-request/`       |
| 컴포넌트              | PascalCase                          | `ui/MedicationCard.tsx`                       |
| 일반 파일·유틸·훅     | kebab-case 파일명, camelCase export | `use-medication-list.ts`, `useMedicationList` |
| 타입·스키마·상수 파일 | kebab-case 파일명                   | `types.ts`, `schema.ts`                       |
| 타입                  | PascalCase                          | `MedicationType`, `MedicationCardProps`       |
| 에셋 컴포넌트         | PascalCase                          | `Logo.tsx`                                    |

기존 슬라이스의 파일명 관례가 있으면 그 관례를 따른다.

## Import / Export

- 배럴은 슬라이스의 외부 공개 API가 필요할 때만 `index.ts`로 만든다.
- 서버 전용 API(`server-only`)는 `index.server.ts`로 분리한다. 클라이언트 배럴에 서버 모듈을 섞지 않는다.
- import 정렬은 ESLint `simple-import-sort`가 자동 처리한다. 직접 순서를 맞추지 말고 린트 자동 수정을 사용한다.
- 순서: `react` → `next/*` → 외부 → `@/` → 상대경로.

```ts
// src/entities/medication/index.ts
export * from './model/types';
export * from './model/use-medication-list';
export { default as MedicationCard } from './ui/MedicationCard';

// 하위 레이어 소비
import { get } from '@/shared';
```

## 타입

- TypeScript strict를 유지한다.
- 객체 구조는 `interface`, 간단한 유니온은 `type`을 사용한다.
- 타입은 PascalCase다. props는 `...Props`, 요청·응답 타입은 각각 `...ReqType`, `...ResponseType`을 사용한다.
- `enum`은 금지한다. 유니온과 `as const` 객체 또는 `Record<유니온, 메타>`를 사용한다.

```ts
export type MedicationStatusType = 'SCHEDULED' | 'TAKEN' | 'MISSED';

const MEDICATION_STATUS_META: Record<MedicationStatusType, { label: string }> = {
  SCHEDULED: { label: '복용 예정' },
  TAKEN: { label: '복용 완료' },
  MISSED: { label: '복용 누락' },
};
```

## 컴포넌트

- 컴포넌트는 PascalCase 파일명, 화살표 함수, `default export`를 사용한다.
- props는 구조 분해하고 `...Props` 인터페이스로 선언한다.
- 본문 순서는 변수·훅 → 핸들러·기타 로직 → `useEffect` → `return`으로 유지한다.

```tsx
interface MedicationCardProps {
  medication: MedicationType;
}

const MedicationCard = ({ medication }: MedicationCardProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClick = () => setIsOpen(true);

  useEffect(() => {}, []);

  return <div />;
};

export default MedicationCard;
```

## 스타일링

- Tailwind 클래스를 사용한다. 정적 클래스명은 하나의 문자열로 작성한다.
- `cn()`은 조건부 클래스 또는 외부 `className` 병합이 필요할 때만 사용한다. 필요해질 때 이미 설치된 `clsx`, `tailwind-merge`로 최소 유틸을 만든다.
- 반복되는 클래스명은 실제로 반복될 때만 해당 슬라이스의 `ui/styles.ts` 상수로 분리한다.
- 전역 토큰·base 스타일은 `src/app/globals.css`가 소유한다. 폰트는 `src/app/layout.tsx`의 `localFont` 설정을 사용하며, 컴포넌트에서 중복 지정하지 않는다.

```tsx
// ❌ 조건이 없는데 cn()
className={cn('flex items-center gap-2')}

// ✅ 정적 클래스
className="flex items-center gap-2"

// ✅ 조건부 또는 외부 className 병합
className={cn('flex gap-2', isActive && 'bg-primary')}
className={cn('rounded-lg px-4', className)}
```

## API와 서버 경계

### 인스턴스

| 용도                    | 모듈                    | baseURL                    | 토큰                                                                         |
| ----------------------- | ----------------------- | -------------------------- | ---------------------------------------------------------------------------- |
| 브라우저                | `@/shared`              | `/api`                     | 쿠키의 Bearer token. 401에서 refresh를 한 번 수행하고 실패 시 `/signin` 이동 |
| 서버(RSC·Server Action) | `@/shared/index.server` | `NEXT_PUBLIC_API_BASE_URL` | `next/headers` 쿠키. 갱신하지 않고 401을 그대로 던짐                         |

- 브라우저 요청은 `next.config.ts`의 `/api/:path*` rewrite를 거쳐 API 서버로 전달한다.
- `NEXT_PUBLIC_API_BASE_URL`은 API 서버 origin이다. `.env.local`에 설정하며 rewrite와 서버 Axios가 사용한다.
- 브라우저 클라이언트는 `axiosInstance`와 `get / post / patch / put / del`만 사용한다.
- 서버 컴포넌트와 Server Action은 `serverAxiosInstance`만 사용한다. 서버에서 토큰을 갱신하지 않는다.

### 메서드 래퍼

`@/shared`의 `get / post / patch / put / del`을 사용한다. 응답 인터셉터가 `response.data`를 반환하므로 `axiosInstance`를 직접 쓰면 타입이 실제 응답과 어긋날 수 있다.

```ts
const medications = await get<MedicationType[]>(medicationUrl.getMedications());
```

`Parameters<typeof ...>` 기반 메서드 래퍼의 body 인자는 `any`이므로, 요청 body는 zod 스키마에서 추론한 `...ReqType` 변수로 넘긴다.

### URL 상수

- URL 상수는 API 서버 origin 뒤의 경로만 가진다. 브라우저는 `/api` base URL이 앞에 붙고 rewrite가 이를 제거해 API 서버로 전달한다.
- 공용 인증 URL은 `src/shared/api/endpoints.ts`에, 도메인 URL은 해당 엔티티 또는 기능 슬라이스 `api/`에 둔다.

```ts
export const medicationUrl = {
  getMedications: () => '/v1/medications',
  getMedication: (id: number) => `/v1/medications/${id}`,
  postMedication: () => '/v1/medications',
} as const;
```

### 훅 · Query Key

- 훅 이름은 `useGet<리소스>` / `usePost<리소스>` / `usePatch<리소스>` / `usePut<리소스>` / `useDelete<리소스>`를 사용한다.
- Query Key는 `all()`과 계층 배열을 사용해 정밀 무효화가 가능하도록 구성한다.

```ts
export const medicationQueryKeys = {
  all: () => ['medications'] as const,
  getMedications: () => ['medications', 'list'] as const,
  getMedication: (medicationId?: number) => ['medications', 'detail', medicationId] as const,
} as const;
```

## zod

- 스키마는 `<이름>Schema`(PascalCase), 추론 타입은 `...ReqType`으로 선언한다.

```ts
export const MedicationRegistrationSchema = z.object({
  name: z.string().trim().min(1, '약 이름을 입력해주세요'),
});

export type MedicationRegistrationReqType = z.infer<typeof MedicationRegistrationSchema>;
```

## 검증

변경 범위에 맞춰 실행한다.

```bash
pnpm lint:fsd
pnpm lint
pnpm format:check
pnpm build
```

`pnpm build`에는 `NEXT_PUBLIC_API_BASE_URL`이 필요하다. 전체 FSD 검사에는 `pnpm lint:fsd`를 사용한다.

## 알려진 트레이드오프

- 토큰이 JS로 읽히는 쿠키에 저장되어 XSS 시 탈취될 수 있다. HttpOnly 쿠키와 Route Handler 프록시가 정석이지만 현재는 미적용이다.
- FSD `app` 레이어를 Next `src/app`과 합쳤다. 분리하면 라우팅 파일과 Provider가 흩어진다.
- 레이어 import 규칙은 `node scripts/check-fsd-dependencies.mjs`와 `pnpm lint:fsd`로 검사한다. 전자는 비표준 `views` 레이어를 포함한 방향성을 검사한다.
- 서버 API는 별도 `index.server.ts` 진입점으로 분리한다. 클라이언트 배럴에 섞으면 RSC 경계가 깨질 수 있다.
