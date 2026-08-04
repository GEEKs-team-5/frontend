# 디자인 시스템 반영 설계

## 목표

Figma 디자인 시스템을 앱의 전역 색상·타이포그래피 토큰과 PWA 브랜딩에 반영한다. 화면 컴포넌트가 아직 없으므로 범용 UI 라이브러리는 만들지 않는다.

## 반영 범위

- `src/app/globals.css`에 Tailwind CSS 4 `@theme` 색상 토큰을 추가한다.
- 같은 파일에 반응형 Display, Heading, Body 타이포그래피 값을 CSS 사용자 정의 속성으로 정의한다.
- `src/app/manifest.ts`의 `theme_color`와 `src/app/icon.svg`의 브랜드색을 Figma 대표색으로 통일한다.

## 색상 토큰

| 그룹 | 값 |
| --- | --- |
| Primary | 50 `#EDF8FE`, 100 `#CEEBFF`, 200 `#9CD8FF`, 300 `#65BCEE`, 400 `#3EA5E3`, 500 `#1C8DD3`, 600 `#1273AE`, 700 `#0B588B`, 800 `#063F65`, 900 `#012542` |
| Secondary | 50 `#FFF0F5`, 100 `#FFD6E5`, 200 `#FFBCD5`, 300 `#FF9BBF`, 400 `#FF78A9`, 500 `#F55490`, 600 `#D93878`, 700 `#B31F5E`, 800 `#8C0F45`, 900 `#5C002B` |
| Neutral | 0 `#FFFFFF`, 50 `#F8F9FA`, 100 `#F1F3F5`, 200 `#E9ECEF`, 300 `#DEE2E6`, 400 `#CED4DA`, 500 `#ADB5BD`, 600 `#868E96`, 700 `#495057`, 800 `#343A40`, 900 `#212529`, 1000 `#000000` |
| System | success `#2E7D52`, warning `#F59E0B`, error `#DC2626`, info `#7AB6D9` |

`primary/300 #65BCEE`를 대표 브랜드색으로 사용한다.

## 타이포그래피 토큰

폰트는 기존 `PretendardVariable.woff2`를 유지한다. 모든 토큰의 자간은 `0`이다.

| 종류 | 데스크톱 / 모바일·태블릿 | 굵기 | 줄간격 |
| --- | --- | --- | --- |
| Display large | 64px / 48px | 600 | 120% |
| Display medium | 48px / 32px | 600 | 120% |
| Display small | 36px / 24px | 600 | 120% |
| H1 | 32px / 24px | 600 | 120% |
| H2 | 24px / 20px | 600 | 120% |
| H3 | 20px / 18px | 600 | 120% |
| H4 | 16px / 16px | 600 | 120% |
| H5 | 14px / 14px | 600 | 120% |
| Body large | 18px | 400 또는 600 | 140% |
| Body medium | 16px | 400 또는 600 | 140% |
| Body small | 14px | 400 또는 600 | 140% |
| Body xsmall | 12px | 400 또는 600 | 140% |

## 제외 범위

- 버튼, 카드, 입력 필드 같은 범용 primitive
- 아이콘 컴포넌트와 아이콘 세트
- 다크 모드, 오프라인 캐싱, 화면별 스타일 변경

이 항목들은 실제 소비 화면과 상태 요구가 생길 때 해당 슬라이스에 추가한다.

## 검증

`pnpm lint:fsd`, `pnpm lint`, `pnpm format:check`, `pnpm build`를 실행한다. 빌드 후 manifest와 아이콘이 정적 라우트로 생성되는지 확인한다.
