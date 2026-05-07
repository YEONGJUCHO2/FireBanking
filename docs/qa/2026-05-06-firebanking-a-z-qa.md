# FireBanking A-Z QA 정리 (2026-05-06)

## 범위

- 현재 개발 브랜치: `codex/FIREBANK/Debug`
- 점검 대상: 초대, 배우자 Lite 입력, 자산/부채, 투자 종목 검색, 구독, 히스토리, 설정, 주요 미인증 프리뷰 화면
- 목표: 사용자가 실제로 처음부터 눌렀을 때 미구현처럼 보이거나 이상하게 보이는 흐름을 정리하고, 기존 디자인 레이아웃을 최대한 유지한다.

## 실제 점검한 흐름

- `/invite/test-token`에서 초대 문구와 배우자 Lite 진입 흐름 확인
- `/invite/test-token/lite`에서 월수입, 월생활비, 자산 입력 후 제출 동작 확인
- `/assets`에서 국내 투자 종목 검색, 보유 종목 추가, 부채 입력/추가 동작 확인
- `/subscribe`에서 스냅샷이 없을 때 잘못된 예시 수치가 노출되지 않는지 확인
- `/settings`에서 로그인하지 않은 사용자의 연결 상태와 로그아웃 버튼 노출 여부 확인
- 주요 쇼케이스/프리뷰 E2E 화면을 Chromium과 mobile-safari 프로젝트로 확인

## 정리한 문제

- 외부 폰트 CDN 403 콘솔 오류 제거
- 배우자 Lite 입력이 저장되지 않던 흐름을 서버 액션과 DB 테이블로 연결
- 초대/Lite 화면의 오래된 R1 알파 안내 문구 제거
- 파트너 완료 상태가 실제 Lite 입력 기준으로 계산되도록 수정
- 히스토리 페이지가 하드코딩 빈 상태만 보여주던 문제 수정
- 미로그인 설정 화면이 연결된 계정처럼 보이던 문제 수정
- 구독 페이지가 스냅샷 없이 가짜 현금흐름 수치를 보여주던 문제 수정
- 자산 화면의 CTA, 투자 종목 검색/추가, 부채 추가 흐름을 실제 조작 가능하게 보강
- 국내 종목 검색/저장 시 `asset_instruments` 업서트가 RLS에 막히지 않도록 서버 관리자 클라이언트로 분리
- 배포 환경에 국내 시세 API 키가 없을 때도 삼성전자 등 기본 종목 검색은 막히지 않도록 폴백 제공
- 로그인 버튼의 `G-mail` 문구를 `Google`로 정리

## 검증 결과

- `npm run lint` 통과
- `npm run typecheck` 통과
- `npm run build` 통과
- `npm run test` 통과: 57 files, 200 tests
- `npm run test:e2e` 통과: 36 tests

## 배포 확인

- Supabase 원격 DB에 `0007_partner_lite_checkins.sql`과 `0008_lock_couple_admin_membership_policies.sql`까지 적용 완료했다.
- 미로그인 상태에서 Lite 제출은 로그인 필요 오류가 뜨는 것이 정상이다.
- 인증/OAuth 콜백과 실제 초대 토큰 저장은 배포 환경의 Supabase URL, OAuth redirect URL, RLS 정책이 맞아야 최종 확인할 수 있다.
