# Fire Banking Front Design

이미지 시안의 분위기를 Next.js 16 + React 19 + Tailwind CSS 4 코드로 옮긴 프론트 구현 패키지입니다.

## 포함된 화면

- `/` 로그인 / 진입
- `/onboarding` R0 온보딩 입력
- `/dashboard` 결과 대시보드 + 데스크톱 대응
- `/invite/[token]` 초대 수락 + Lite 입력
- `/subscribe` 고정비 시뮬레이터
- `/design-system` 디자인 시스템 샘플
- `/showcase` 이미지 시안처럼 모든 화면을 한 번에 보는 쇼케이스

## 실행

```bash
npm install
npm run dev
```

## 기존 프로젝트에 붙이기

아래 폴더를 기존 Next.js App Router 프로젝트에 복사하세요.

```txt
app/globals.css
app/page.tsx
app/onboarding/page.tsx
app/dashboard/page.tsx
app/invite/[token]/page.tsx
app/subscribe/page.tsx
app/design-system/page.tsx
app/showcase/page.tsx
components/fire-banking/
lib/
```

Tailwind CSS 4 기준이라 `postcss.config.mjs`에는 다음이 필요합니다.

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

`app/layout.tsx`에서는 `import './globals.css'`가 필요합니다.

## 아직 연결하지 않은 부분

- Supabase 인증 / DB 저장
- 실제 초대 토큰 검증
- 카카오 SDK 공유
- 실제 계산 엔진과의 병합
- 폼 제출 및 서버 액션

현재는 디자인 구현용 정적/클라이언트 UI입니다.
