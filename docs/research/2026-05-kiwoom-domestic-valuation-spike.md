# Kiwoom Domestic Valuation Spike

- 작성일: 2026-05-01
- 대상 기능: 투자자산 자동평가 1차 릴리즈
- 검증 범위: 국내주식, 국내 ETF, 국내상장 미국 ETF의 종가 자동평가 가능성

## Verdict

**CONDITIONAL**

키움 REST API는 1차 provider 후보로 유지한다. 공식 문서상 국내주식, 차트, 종목정보, ETF 관련 TR이 있고, REST 방식으로 서버에서 호출 가능한 구조다. 다만 App Key/App Secret이 없는 상태에서는 실제 360750, 379810 같은 국내상장 미국 ETF 종가 조회를 라이브 호출로 확인하지 못했다.

따라서 결정은 아래와 같다.

```text
Proceed with provider boundary and non-live implementation.
Do not ship live Kiwoom price sync until credentials are obtained and tested.
```

## Required Checks

### Domestic stock last close endpoint

공식 API 가이드에 국내주식 `차트` 항목이 있고, `주식일봉차트조회요청 ka10081`이 확인된다.

- Candidate TR: `ka10081`
- Category: 국내주식 > 차트
- Use: 국내주식 일봉 데이터에서 마지막 거래일 종가 조회 후보
- Source: https://openapi.kiwoom.com/m/guide/apiguide

### Domestic ETF last close endpoint

공식 API 가이드에 ETF 항목이 별도로 있고, 아래 TR들이 확인된다.

- `ka40002`: ETF종목정보요청
- `ka40003`: ETF일별추이요청
- `ka40004`: ETF전체시세요청
- `ka40008`: ETF일자별체결요청

1차 자동평가에는 `ka40003 ETF일별추이요청`이 가장 직접적인 후보로 보인다.

- Source: https://openapi.kiwoom.com/m/guide/apiguide

### Korean-listed US exposure ETF example checked

라이브 API 호출은 하지 못했다.

문서상 판단:

- TIGER 미국S&P500, KODEX 미국나스닥100 같은 상품은 미국상장 ETF가 아니라 국내시장에 상장된 ETF다.
- 키움 REST API 소개에서 매매 가능 상품은 `국내 주식`으로 표시된다.
- API 가이드에 ETF 카테고리가 있으므로 국내상장 ETF 조회 후보는 존재한다.

남은 확인:

```text
360750 TIGER 미국S&P500
379810 KODEX 미국나스닥100
```

위 두 종목이 `ka40003` 또는 `ka10081`로 안정 조회되는지 App Key 확보 후 실제 호출해야 한다.

### Instrument search or instrument master source

공식 API 가이드에서 국내주식 종목정보 항목 아래 다음 TR이 확인된다.

- `ka10099`: 종목정보 리스트
- `ka10100`: 종목정보 조회

검색/마스터 후보:

```text
1. ka10099로 종목 리스트를 가져와 앱 DB에 캐시
2. 앱 내부에서 종목명/종목코드 검색
3. ETF 시장구분 또는 ETF TR 결과로 ETF 여부 보강
```

주의:

공식 문서 화면만으로는 `ka10099`의 ETF 시장구분 값과 응답 필드 전체를 충분히 확인하지 못했다. 실제 호출 또는 로그인 후 명세서 다운로드로 확인해야 한다.

### Auth method

공식 API 가이드는 OAuth 접근토큰 발급을 제공한다.

- Method: `POST`
- URL: `/oauth2/token`
- Body:
  - `grant_type`: `client_credentials`
  - `appkey`
  - `secretkey`
- Source: https://openapi.kiwoom.com/m/guide/apiguide

### Token lifetime

접근토큰 발급 응답에는 `expires_dt`, `token_type`, `token`이 포함된다.

문서 예시상 `expires_dt`가 내려오므로 서버는 토큰 만료 시점을 저장하고 재발급해야 한다.

### Server IP registration requirement

키움 REST API 이용안내는 키움증권 계좌가 필요하다고 안내한다. 또한 사용자 인증정보 탈취 방지를 위해 IP를 수집하고, 허용된 IP에서만 API 인증이 가능하다고 설명한다.

운영 영향:

```text
Vercel/서버리스 환경에서 고정 outbound IP가 없으면 운영이 까다로울 수 있다.
고정 IP가 가능한 서버 또는 proxy가 필요할 수 있다.
```

- Source: https://openapi.kiwoom.com/intro/serviceInfo
- Source: https://openapi.kiwoom.com/main

### Rate limits

공개 공식 페이지에서 명확한 REST 호출 제한 수치를 확인하지 못했다.

확인 필요:

```text
로그인 후 API 명세서 다운로드
Q&A/FAQ 확인
키움 고객센터 또는 API 게시판 확인
```

운영 계획:

1차 구현은 아래 방식으로 호출량을 낮춘다.

```text
1. 보유 중인 active instrument만 조회
2. 같은 종목은 couple별로 중복 호출하지 않고 instrument 기준으로 하루 1회 조회
3. 월말 스냅샷 전 강제 갱신도 instrument 기준으로 중복 제거
```

### Pricing or usage cost

공개 공식 소개 페이지에서 REST API 데이터 호출 비용을 명확히 확인하지 못했다.

확인된 내용:

- REST API 소개의 사용안내 표에는 가능 상품이 국내 주식으로 표시된다.
- 적용 수수료율은 영웅문4와 동일하다고 안내된다. 이는 주문/매매 수수료 문맥으로 읽힌다.
- AI 코딩 어시스턴트는 베타 기간 별도 이용 수수료 없이 제공되지만, 이는 시장 데이터 API 사용료와 다른 항목이다.

결론:

```text
API 데이터 조회 과금은 미확인이다.
라이브 구현 전 키움 로그인 영역 또는 고객센터/Q&A로 확인해야 한다.
```

- Source: https://openapi.kiwoom.com/intro?dummyVal=0
- Source: https://openapi.kiwoom.com/assist/aiAssistIntro

### Weekend/holiday last trading-day behavior

공식 문서에서 휴장일 기준 마지막 거래일 자동 선택 규칙을 확인하지 못했다.

구현 방침:

```text
앱이 asOfDate 이하의 가격 snapshot 중 가장 최신 valuation_date를 선택한다.
Provider는 특정 날짜의 값이 없을 수 있다고 보고 null을 허용한다.
월말 스냅샷 생성 전에는 snapshot_date 이하 최신 price를 사용한다.
```

이 방식이면 provider가 휴장일을 직접 알려주지 않아도 월말 이하 마지막 거래일 종가를 선택할 수 있다.

## Tested Symbols

| Symbol | Name | Expected Type | Result |
|---|---|---|---|
| 005930 | 삼성전자 | 국내주식 | 공식 문서상 `ka10081` 후보. 라이브 호출 미실행 |
| 360750 | TIGER 미국S&P500 | 국내 ETF | 공식 문서상 ETF TR 후보. 라이브 호출 미실행 |
| 379810 | KODEX 미국나스닥100 | 국내 ETF | 공식 문서상 ETF TR 후보. 라이브 호출 미실행 |

## Decision

```text
Proceed with `KiwoomDomesticValuationProvider` boundary.
Keep live Kiwoom calls behind credentials and real-symbol verification.
```

구현 계획상 다음 단계는 가능하다.

```text
1. DomesticValuationProvider interface 구현
2. Kiwoom config/env 검증 구현
3. 테스트용 fake provider 구현
4. 실제 API 호출은 App Key/App Secret과 고정 IP 조건 확인 후 구현
```

실제 API 호출 구현 전에 반드시 확인할 것:

```text
1. ka40003 또는 ka10081로 360750, 379810 종가가 조회되는지
2. ka10099로 ETF 종목 리스트를 가져올 수 있는지
3. 호출 제한과 비용이 일일 갱신에 충분한지
4. 배포 환경에서 고정 outbound IP를 제공할 수 있는지
```

## Sources

- Kiwoom REST API 소개: https://openapi.kiwoom.com/intro?dummyVal=0
- Kiwoom REST API 이용안내: https://openapi.kiwoom.com/intro/serviceInfo
- Kiwoom REST API 메인: https://openapi.kiwoom.com/main
- Kiwoom REST API 가이드: https://openapi.kiwoom.com/m/guide/apiguide
- Kiwoom AI 코딩 어시스턴트 안내: https://openapi.kiwoom.com/assist/aiAssistIntro
