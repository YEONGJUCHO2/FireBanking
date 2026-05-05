"use client";

import { Button } from "./button";
import { Card } from "./card";

export interface OnboardingResultBridgeProps {
  targetAssetMan: number;
  currentNetWorthMan: number;
  remainingMan: number;
  targetMonthlyExpenseMan: number;
  onInviteSpouse: () => void;
  onContinueToDashboard: () => void;
}

function formatKoreanEok(valueManWon: number): string {
  const v = Math.max(0, Math.round(valueManWon));
  const eok = Math.floor(v / 10000);
  const remainder = v % 10000;
  if (eok === 0) return `${remainder.toLocaleString("ko-KR")}만원`;
  if (remainder === 0) return `${eok.toLocaleString("ko-KR")}억원`;
  return `${eok.toLocaleString("ko-KR")}억 ${remainder.toLocaleString("ko-KR")}만원`;
}

export function OnboardingResultBridge({
  targetAssetMan,
  currentNetWorthMan,
  remainingMan,
  targetMonthlyExpenseMan,
  onInviteSpouse,
  onContinueToDashboard,
}: OnboardingResultBridgeProps) {
  const percent = targetAssetMan > 0 ? Math.min(currentNetWorthMan / targetAssetMan, 1) : 0;
  const percentDisplay = Math.round(percent * 100);

  return (
    <div
      data-screen-label="onboarding-result"
      className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col gap-5 px-4 pb-10 pt-6"
    >
      <header className="flex flex-col gap-2" data-od-id="result-header">
        <h1 className="text-xs font-bold uppercase tracking-wide text-fb-trust">첫 FIRE 결과</h1>
        <p className="text-2xl font-extrabold leading-tight text-fb-ink">
          우리 가정의 경제적 자유
          <br />
          현재 위치
        </p>
        <p className="text-sm leading-6 text-fb-ink-2">
          입력하신 4가지 숫자로 계산한 첫 결과예요. 배우자가 3가지 숫자를 더해주면 더 정확해져요.
        </p>
      </header>

      <div data-od-id="hero-fire">
        <Card className="p-5">
          <p className="text-xs font-bold text-fb-ink-2">FIRE 목표 자산</p>
          <p className="mt-1 fb-num text-2xl font-black text-fb-trust">
            {formatKoreanEok(targetAssetMan)}
          </p>
          <p className="mt-1 text-xs text-fb-ink-3">
            월 {targetMonthlyExpenseMan.toLocaleString("ko-KR")}만원 생활비 × 25배 기준
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-fb-line">
            <div
              className="h-full rounded-full bg-fb-trust transition-all"
              style={{ width: `${percentDisplay}%` }}
              aria-label={`FIRE 달성률 ${percentDisplay}%`}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-fb-ink-3">
            <span className="fb-num">{percentDisplay}% 달성</span>
            <span className="fb-num">{formatKoreanEok(currentNetWorthMan)} 보유</span>
          </div>
        </Card>
      </div>

      <div data-od-id="remaining-summary">
        <Card className="p-5">
          <p className="text-xs font-bold text-fb-ink-2">FIRE까지 남은 금액</p>
          <p className="mt-2 text-3xl font-black text-fb-ink fb-num">
            {remainingMan.toLocaleString("ko-KR")}만원
          </p>
          <p className="mt-3 text-sm leading-6 text-fb-ink-2">
            연간 생활비의 25배를 목표로 계산했어요. (5% 연 복리 가정)
          </p>
        </Card>
      </div>

      <div data-od-id="spouse-recommendation">
        <Card tone="trust" className="p-5">
          <p className="text-sm font-bold text-fb-trust-ink">배우자가 함께 입력하면 더 정확해져요</p>
          <p className="mt-2 text-sm leading-6 text-fb-trust-ink/80">
            세후 월소득, 월 고정지출, 월 저축·투자 — 3가지만 받으면 돼요.
          </p>
        </Card>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <Button
          full
          onClick={onInviteSpouse}
          data-od-id="cta-primary"
        >
          배우자에게 3가지 묻기
        </Button>
        <Button
          variant="secondary"
          full
          onClick={onContinueToDashboard}
          data-od-id="cta-secondary"
        >
          먼저 대시보드 보기
        </Button>
      </div>
    </div>
  );
}
