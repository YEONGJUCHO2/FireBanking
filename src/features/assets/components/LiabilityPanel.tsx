"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, SectionHeader, StatusPill } from "@/components/fire-banking";
import { updateLiability } from "@/src/features/assets/actions/updateLiability";
import { formatKrw } from "@/src/lib/format";

export type LiabilityView = {
  id: string;
  label: string;
  purposeLabel: string;
  balanceAmount: number;
  monthlyInterestAmount: number;
  monthlyPrincipalAmount: number;
  purpose?: "residence" | "investment" | "lifestyle_credit" | "other";
};

const defaultLiabilities: LiabilityView[] = [
  {
    id: "sample-investment-loan",
    label: "투자 관련 대출",
    purposeLabel: "투자 관련",
    balanceAmount: 15_000_000,
    monthlyInterestAmount: 100_000,
    monthlyPrincipalAmount: 300_000,
    purpose: "investment",
  },
];

export function LiabilityPanel({
  coupleId,
  liabilities = defaultLiabilities,
}: {
  coupleId?: string | null;
  liabilities?: LiabilityView[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(liabilities);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    balanceManwon: "",
    interestManwon: "",
    principalManwon: "",
  });
  const investmentLinkedLoanBalance = items
    .filter((liability) => liability.purpose === "investment")
    .reduce((sum, liability) => sum + liability.balanceAmount, 0);
  const monthlyInterest = items.reduce(
    (sum, liability) => sum + liability.monthlyInterestAmount,
    0,
  );
  const monthlyPrincipal = items.reduce(
    (sum, liability) => sum + liability.monthlyPrincipalAmount,
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

    if (coupleId) {
      const current = items.find((item) => item.id === liabilityId);
      const formData = new FormData();
      formData.set("coupleId", coupleId);
      formData.set("liabilityId", liabilityId);
      formData.set("purpose", current?.purpose ?? "investment");
      formData.set("balanceAmount", String(balance));
      formData.set("monthlyInterestAmount", String(interest));
      formData.set("monthlyPrincipalAmount", String(principal));
      startTransition(async () => {
        const result = await updateLiability({}, formData);
        if (result.success) {
          router.refresh();
        }
      });
    }
  };

  return (
    <Card className="p-5 md:p-6">
      <SectionHeader
        title="투자 연동 대출"
        subtitle="투자자산을 만들기 위해 낀 대출만 FIRE 반영 투자자산에서 차감해요."
        action={<StatusPill label={isPending ? "저장 중" : "FIRE 보정"} status="info" />}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[16px] border border-fb-line bg-fb-card-alt p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Summary label="차감 대상 대출" value={formatKrw(investmentLinkedLoanBalance)} />
            <Summary label="월 이자" value={formatKrw(monthlyInterest)} />
            <Summary label="월 원금상환" value={formatKrw(monthlyPrincipal)} />
          </div>
          <p className="mt-4 rounded-[12px] bg-white px-3 py-3 text-[12px] leading-5 text-fb-ink-3">
            우리사주 대출, 주식담보대출처럼 투자자산을 사기 위해 빌린 돈은 투자자산 평가액에서
            빼야 FIRE 금액을 과대평가하지 않아요.
          </p>
          <p className="mt-3 text-[12px] leading-5 text-fb-ink-3">
            주거/생활 부채는 이 진단 KPI에서 기본 제외하고, 생활비 조정기나 월 현금흐름에서
            따로 다뤄요.
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
                  className={`grid gap-3 rounded-[12px] border border-fb-line bg-white p-3 ${
                    editingId === liability.id ? "" : "md:grid-cols-[1fr_auto]"
                  }`}
                >
                  <div>
                    <p className="text-[14px] font-bold text-fb-ink">{liability.label}</p>
                    {editingId === liability.id ? (
                      <div className="mt-3 rounded-[12px] bg-fb-card-alt p-3">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <MoneyInput
                            id={`${liability.id}-balance`}
                            label={`${liability.label} 잔액`}
                            helper="대출 잔액"
                            value={draft.balanceManwon}
                            onChange={(value) => setDraft((current) => ({ ...current, balanceManwon: value }))}
                          />
                          <MoneyInput
                            id={`${liability.id}-interest`}
                            label={`${liability.label} 월 이자`}
                            helper="월 이자"
                            value={draft.interestManwon}
                            onChange={(value) => setDraft((current) => ({ ...current, interestManwon: value }))}
                          />
                          <MoneyInput
                            id={`${liability.id}-principal`}
                            label={`${liability.label} 월 원금상환`}
                            helper="월 원금상환"
                            value={draft.principalManwon}
                            onChange={(value) =>
                              setDraft((current) => ({ ...current, principalManwon: value }))
                            }
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-fb-line pt-3">
                          <p className="text-[12px] font-medium text-fb-ink-3">입력 단위는 만원이에요.</p>
                          <Button type="button" variant="secondary" size="sm" onClick={() => saveEdit(liability.id)}>
                            저장
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-[12px] text-fb-ink-3">
                        {liability.purpose === "investment" ? "FIRE 반영 투자자산에서 차감" : "이 진단 KPI에서는 제외"} ·
                        이자 {formatKrw(liability.monthlyInterestAmount)} · 원금상환{" "}
                        {formatKrw(liability.monthlyPrincipalAmount)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    {editingId === liability.id ? null : (
                      <>
                        <p className="fb-num text-[15px] font-bold text-fb-ink">
                          {formatKrw(liability.balanceAmount)}
                        </p>
                      <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(liability)}>
                        부채 수정
                      </Button>
                      </>
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
  helper,
  value,
  onChange,
}: {
  id: string;
  label: string;
  helper: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-[12px] font-bold text-fb-ink-2" htmlFor={id}>
        {helper}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-[10px] border border-fb-line bg-white px-3 text-[13px] font-semibold text-fb-ink outline-none focus:border-fb-trust"
        inputMode="numeric"
        aria-label={label}
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
