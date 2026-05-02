"use client";

import { useState } from "react";
import { Button, Card, SectionHeader, StatusPill } from "@/components/fire-banking";
import { formatKrw } from "@/src/lib/format";

type LiabilityView = {
  id: string;
  label: string;
  purposeLabel: string;
  balanceAmount: number;
  monthlyInterestAmount: number;
  monthlyPrincipalAmount: number;
};

const defaultLiabilities: LiabilityView[] = [
  {
    id: "sample-investment-loan",
    label: "투자 관련 대출",
    purposeLabel: "투자 관련",
    balanceAmount: 15_000_000,
    monthlyInterestAmount: 100_000,
    monthlyPrincipalAmount: 300_000,
  },
];

export function LiabilityPanel({ liabilities = defaultLiabilities }: { liabilities?: LiabilityView[] }) {
  const [items, setItems] = useState(liabilities);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    balanceManwon: "",
    interestManwon: "",
    principalManwon: "",
  });
  const totalBalance = items.reduce((sum, liability) => sum + liability.balanceAmount, 0);
  const monthlyPayment = items.reduce(
    (sum, liability) => sum + liability.monthlyInterestAmount + liability.monthlyPrincipalAmount,
    0,
  );

  const startEdit = (liability: LiabilityView) => {
    setEditingId(liability.id);
    setDraft({
      balanceManwon: String(Math.round(liability.balanceAmount / 10_000)),
      interestManwon: String(Math.round(liability.monthlyInterestAmount / 10_000)),
      principalManwon: String(Math.round(liability.monthlyPrincipalAmount / 10_000)),
    });
  };

  const saveEdit = (liabilityId: string) => {
    const balance = Number(draft.balanceManwon);
    const interest = Number(draft.interestManwon);
    const principal = Number(draft.principalManwon);

    if (![balance, interest, principal].every((value) => Number.isFinite(value) && value >= 0)) {
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === liabilityId
          ? {
              ...item,
              balanceAmount: balance * 10_000,
              monthlyInterestAmount: interest * 10_000,
              monthlyPrincipalAmount: principal * 10_000,
            }
          : item,
      ),
    );
    setEditingId(null);
  };

  return (
    <Card className="p-5 md:p-6">
      <SectionHeader
        title="부채"
        subtitle="이자는 비용으로 보고, 원금상환은 빚이 줄어드는 효과로 계산해요."
        action={<StatusPill label="단순 모델" status="info" />}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[16px] border border-fb-line bg-fb-card-alt p-4">
          <div className="grid grid-cols-2 gap-3">
            <Summary label="총 부채" value={formatKrw(totalBalance)} />
            <Summary label="월 상환 흐름" value={formatKrw(monthlyPayment)} />
          </div>
          <p className="mt-4 rounded-[12px] bg-white px-3 py-3 text-[12px] leading-5 text-fb-ink-3">
            은행 앱의 상환 안내처럼 정교한 원리금 스케줄을 만들기보다, FIRE 예상일에 필요한
            월 현금흐름과 부채 잔액만 단순하게 반영해요.
          </p>
          <p className="mt-3 text-[12px] leading-5 text-fb-ink-3">
            거주 부동산 관련 부채는 기본 FIRE 계산 순자산에서 제외하고, 투자/생활/기타 부채는
            기본 차감해요.
          </p>
        </section>

        <section className="rounded-[16px] border border-fb-line bg-white p-4">
          {items.length === 0 ? (
            <p className="rounded-[12px] bg-fb-card-alt px-3 py-3 text-[13px] font-medium text-fb-ink-3">
              등록한 부채가 없어요.
            </p>
          ) : (
            <div className="grid gap-3">
              {items.map((liability) => (
                <div
                  key={liability.id}
                  className="grid gap-3 rounded-[12px] border border-fb-line bg-white p-3 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="text-[14px] font-bold text-fb-ink">{liability.label}</p>
                    {editingId === liability.id ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <MoneyInput
                          id={`${liability.id}-balance`}
                          label={`${liability.label} 잔액`}
                          value={draft.balanceManwon}
                          onChange={(value) => setDraft((current) => ({ ...current, balanceManwon: value }))}
                        />
                        <MoneyInput
                          id={`${liability.id}-interest`}
                          label={`${liability.label} 월 이자`}
                          value={draft.interestManwon}
                          onChange={(value) => setDraft((current) => ({ ...current, interestManwon: value }))}
                        />
                        <MoneyInput
                          id={`${liability.id}-principal`}
                          label={`${liability.label} 월 원금상환`}
                          value={draft.principalManwon}
                          onChange={(value) => setDraft((current) => ({ ...current, principalManwon: value }))}
                        />
                      </div>
                    ) : (
                      <p className="mt-1 text-[12px] text-fb-ink-3">
                        {liability.purposeLabel} · 이자 {formatKrw(liability.monthlyInterestAmount)} · 원금상환{" "}
                        {formatKrw(liability.monthlyPrincipalAmount)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <p className="fb-num text-[15px] font-bold text-fb-ink">
                      {formatKrw(liability.balanceAmount)}
                    </p>
                    {editingId === liability.id ? (
                      <Button type="button" variant="secondary" size="sm" onClick={() => saveEdit(liability.id)}>
                        저장
                      </Button>
                    ) : (
                      <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(liability)}>
                        부채 수정
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Card>
  );
}

function MoneyInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-[10px] border border-fb-line bg-white px-3 text-[13px] font-semibold text-fb-ink outline-none focus:border-fb-trust"
        inputMode="numeric"
      />
      <p className="mt-1 text-[11px] font-medium text-fb-ink-3">만원</p>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-white px-3 py-3">
      <p className="text-[12px] font-semibold text-fb-ink-3">{label}</p>
      <p className="fb-num mt-1 text-[15px] font-bold text-fb-ink">{value}</p>
    </div>
  );
}
