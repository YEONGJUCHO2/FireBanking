"use client";

import { useMemo, useState, useTransition } from "react";
import type { SaveFixedCostSimulationState } from "@/src/features/subscribe/actions/saveFixedCostSimulation";
import { calculateFixedCostProjection } from "@/src/features/subscribe/lib/fixedCostSimulator";
import type { FixedCostSimulatorConfig } from "@/src/features/subscribe/lib/fixedCostTypes";
import { formatKrw } from "@/src/lib/format";

type SaveAction = (config: FixedCostSimulatorConfig) => Promise<SaveFixedCostSimulationState>;

function formatCompactKrw(value: number) {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1).replace(".0", "")}억`;
  }

  if (value >= 10_000) {
    return `${Math.round(value / 10_000).toLocaleString("ko-KR")}만`;
  }

  return formatKrw(value);
}

function cloneConfig(config: FixedCostSimulatorConfig): FixedCostSimulatorConfig {
  return {
    ...config,
    subscriptionCategories: config.subscriptionCategories.map((category) => ({
      ...category,
      items: category.items.map((item) => ({ ...item })),
    })),
    livingExpenses: config.livingExpenses.map((item) => ({ ...item })),
  };
}

export function FixedCostSimulator({
  initialConfig,
  saveAction,
}: {
  initialConfig: FixedCostSimulatorConfig;
  saveAction: SaveAction;
}) {
  const [config, setConfig] = useState(() => cloneConfig(initialConfig));
  const [shareOpen, setShareOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [saveState, setSaveState] = useState<SaveFixedCostSimulationState>({});
  const [isPending, startTransition] = useTransition();
  const projection = useMemo(() => calculateFixedCostProjection(config), [config]);
  const activeFixedCostCount = config.subscriptionCategories.reduce(
    (total, category) => total + category.items.filter((item) => item.enabled).length,
    0,
  );

  function updateConfig(updater: (next: FixedCostSimulatorConfig) => void) {
    setConfig((current) => {
      const next = cloneConfig(current);
      updater(next);
      return next;
    });
  }

  async function copyCurrentUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyMessage("링크를 복사했어요.");
    } catch {
      setCopyMessage("복사 권한이 막혔어요. 주소창 URL을 직접 복사해주세요.");
    }
  }

  function save() {
    startTransition(async () => {
      const result = await saveAction(config);
      setSaveState(result);
    });
  }

  function addCustomItem() {
    const name = customName.trim();
    const amount = Number(customAmount);

    if (!name || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    updateConfig((next) => {
      const customCategory =
        next.subscriptionCategories.find((category) => category.id === "custom") ??
        next.subscriptionCategories[next.subscriptionCategories.length - 1];

      if (!customCategory) {
        return;
      }

      customCategory.items.push({
        id: `custom-${Date.now()}`,
        name,
        monthlyAmount: amount,
        enabled: true,
      });
    });
    setCustomName("");
    setCustomAmount("");
  }

  return (
    <div className="grid gap-6">
      <section className="grid min-w-0 gap-4 rounded-card border border-fb-line bg-fb-card p-5 shadow-card">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="min-w-0">
            <p className="text-sm font-bold text-fb-trust">고정비 시뮬레이터</p>
            <h1 className="mt-1 text-[24px] font-bold leading-[1.28] tracking-normal text-fb-ink">
              내 고정비가 미래 자산을 얼마나 바꾸는지 확인해요
            </h1>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="fb-focus w-full rounded-button bg-fb-trust px-4 py-3 text-sm font-bold text-white shadow-card hover:bg-fb-trust-strong disabled:opacity-60"
          >
            {isPending ? "저장 중..." : "저장"}
          </button>
        </div>
        {saveState.error ? <p className="text-sm text-fb-negative">{saveState.error}</p> : null}
        {saveState.saved ? <p className="text-sm text-fb-positive">저장했어요.</p> : null}

        <div className="grid min-w-0 gap-3">
          <label className="grid min-w-0 gap-2">
            <span className="text-sm font-medium text-fb-ink-2">월 실수령액</span>
            <input
              type="number"
              min={0}
              step={10_000}
              value={config.monthlyIncome}
              onChange={(event) =>
                updateConfig((next) => {
                  next.monthlyIncome = Number(event.target.value);
                })
              }
              className="fb-input min-w-0 w-full"
            />
          </label>
          <label className="grid min-w-0 gap-2">
            <span className="text-sm font-medium text-fb-ink-2">시뮬레이션 기간</span>
            <input
              aria-label="시뮬레이션 기간"
              type="range"
              min={1}
              max={360}
              value={config.periodMonths}
              onChange={(event) =>
                updateConfig((next) => {
                  next.periodMonths = Number(event.target.value);
                })
              }
            />
            <span className="text-sm text-fb-ink-2">{Math.round(config.periodMonths / 12)}년</span>
          </label>
          <label className="grid min-w-0 gap-2">
            <span className="text-sm font-medium text-fb-ink-2">투자 비율</span>
            <input
              aria-label="투자 비율"
              type="range"
              min={0}
              max={100}
              value={Math.round(config.investmentRatio * 100)}
              onChange={(event) =>
                updateConfig((next) => {
                  next.investmentRatio = Number(event.target.value) / 100;
                })
              }
            />
            <span className="text-sm text-fb-ink-2">
              {Math.round(config.investmentRatio * 100)}%
            </span>
          </label>
          <div className="grid min-w-0 gap-2">
            <span className="text-sm font-medium text-fb-ink-2">예상 수익률</span>
            <div className="flex flex-wrap gap-2">
              {[0.03, 0.05, 0.07].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() =>
                    updateConfig((next) => {
                      next.annualReturnRate = rate;
                    })
                  }
                  className={`fb-focus rounded-button border px-3 py-2 text-sm font-bold ${
                    config.annualReturnRate === rate
                      ? "border-fb-trust bg-fb-trust-soft text-fb-trust"
                      : "border-fb-line text-fb-ink-2"
                  }`}
                >
                  연 {Math.round(rate * 100)}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-3">
          <div className="rounded-soft bg-fb-trust-soft p-3">
            <p className="text-sm text-fb-ink-2">월 고정비</p>
            <p className="text-xl font-semibold">{formatCompactKrw(projection.monthlyFixedExpense)}</p>
          </div>
          <div className="rounded-soft bg-fb-trust-soft p-3">
            <p className="text-sm text-fb-ink-2">매월 남는 돈</p>
            <p className="text-xl font-semibold">{formatCompactKrw(projection.monthlyRemainingCash)}</p>
          </div>
          <div className="rounded-soft bg-fb-trust-soft p-3">
            <p className="text-sm text-fb-ink-2">고정비 영향</p>
            <p className="text-xl font-semibold">
              +{formatCompactKrw(projection.futureFixedCostImpact)}
            </p>
          </div>
          <div className="rounded-soft bg-fb-trust-soft p-3">
            <p className="text-sm text-fb-ink-2">투자 예상액</p>
            <p className="text-xl font-semibold">
              {formatCompactKrw(projection.futureInvestmentValue)}
            </p>
          </div>
        </div>

        <div className="min-w-0 rounded-card border border-fb-line bg-white p-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-fb-ink">소비 누적 vs 투자 결과</p>
              <p className="mt-1 text-sm text-fb-ink-2">
                같은 고정비를 줄여 투자하면 FIRE까지 약{" "}
                <strong className="text-fb-trust">
                  {Math.floor(projection.fireMonthsSaved / 12)}년 {projection.fireMonthsSaved % 12}개월
                </strong>{" "}
                당길 수 있어요.
              </p>
            </div>
            <span className="self-start rounded-full bg-fb-trust-soft px-3 py-1 text-xs font-bold text-fb-trust">
              {activeFixedCostCount}개 활성
            </span>
          </div>
          <div className="mt-4 flex h-20 items-end gap-3">
            <ComparisonBar
              label="소비 누적"
              value={projection.simpleFixedCostTotal}
              max={Math.max(projection.simpleFixedCostTotal, projection.futureFixedCostImpact, 1)}
            />
            <ComparisonBar
              label="투자 결과"
              value={projection.futureFixedCostImpact}
              max={Math.max(projection.simpleFixedCostTotal, projection.futureFixedCostImpact, 1)}
              trust
            />
          </div>
        </div>
      </section>

      <section className="grid min-w-0 gap-4">
        <div>
          <h2 className="text-2xl font-semibold">내 고정비 찾기</h2>
          <p className="mt-1 text-sm text-fb-ink-2">
            해당하는 항목을 켜면 미래 자산 영향이 바로 바뀝니다.
          </p>
        </div>
        {config.subscriptionCategories.map((category) => {
          const categoryTotal = category.items.reduce(
            (total, item) => total + (item.enabled ? item.monthlyAmount : 0),
            0,
          );

          return (
          <div key={category.id} className="min-w-0 rounded-card border border-fb-line bg-fb-card p-4 shadow-card">
              <div className="flex min-w-0 flex-col gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-fb-ink-2">{category.prompt}</p>
                </div>
                <p className="text-sm font-semibold text-fb-trust">
                  {formatKrw(categoryTotal)}
                </p>
              </div>
              <div className="mt-3 grid min-w-0 gap-2">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className={`grid min-w-0 gap-2 rounded-soft border p-3 ${
                      item.enabled
                        ? "border-fb-trust bg-fb-trust-soft text-fb-trust"
                        : "border-fb-line bg-fb-card text-fb-ink-2"
                    }`}
                  >
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateConfig((next) => {
                            const targetCategory = next.subscriptionCategories.find(
                              (candidate) => candidate.id === category.id,
                            );
                            const targetItem = targetCategory?.items.find(
                              (candidate) => candidate.id === item.id,
                            );
                            if (targetItem) {
                              targetItem.enabled = !targetItem.enabled;
                            }
                          })
                        }
                        className="min-w-0 flex-1 text-left text-sm font-semibold"
                      >
                        {item.name}
                      </button>
                      <span className="text-xs font-medium text-fb-ink-2">
                        {item.enabled ? "포함" : "제외"}
                      </span>
                    </div>
                    <label className="grid min-w-0 gap-1">
                      <span className="text-xs font-medium text-fb-ink-2">
                        {item.name} 월 금액
                      </span>
                      <input
                        aria-label={`${item.name} 월 금액`}
                        type="number"
                        min={0}
                        step={1000}
                        value={item.monthlyAmount}
                        onChange={(event) =>
                          updateConfig((next) => {
                            const targetCategory = next.subscriptionCategories.find(
                              (candidate) => candidate.id === category.id,
                            );
                            const targetItem = targetCategory?.items.find(
                              (candidate) => candidate.id === item.id,
                            );
                            if (targetItem) {
                              targetItem.monthlyAmount = Number(event.target.value);
                            }
                          })
                        }
                        className="fb-input min-w-0 w-full px-2 py-2 text-sm"
                      />
                    </label>
                  </div>
                ))}
              </div>
              {category.id === "custom" ? (
                <div className="mt-3 grid min-w-0 gap-2 rounded-soft border border-dashed border-fb-line-strong bg-white p-3">
                  <input
                    aria-label="직접 추가 항목명"
                    value={customName}
                    onChange={(event) => setCustomName(event.target.value)}
                    placeholder="예: 주차 정기권"
                    className="fb-input min-w-0 w-full px-3 py-2 text-sm"
                  />
                  <input
                    aria-label="직접 추가 월 금액"
                    type="number"
                    min={0}
                    step={1000}
                    value={customAmount}
                    onChange={(event) => setCustomAmount(event.target.value)}
                    placeholder="월 금액"
                    className="fb-input min-w-0 w-full px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addCustomItem}
                    className="fb-focus rounded-button bg-fb-ink px-4 py-2 text-sm font-bold text-white"
                  >
                    추가
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </section>

      <section className="min-w-0 rounded-card border border-fb-line bg-fb-card p-4 shadow-card">
        <h2 className="text-2xl font-semibold">실생활 고정지출</h2>
        <div className="mt-4 grid min-w-0 gap-3">
          {config.livingExpenses.map((item) => (
            <label key={item.id} className="grid min-w-0 gap-2">
              <span className="text-sm font-medium text-fb-ink-2">{item.name}</span>
              <input
                type="number"
                min={0}
                step={10_000}
                value={item.monthlyAmount}
                onChange={(event) =>
                  updateConfig((next) => {
                    const target = next.livingExpenses.find((candidate) => candidate.id === item.id);
                    if (target) {
                      target.monthlyAmount = Number(event.target.value);
                    }
                  })
                }
                className="fb-input min-w-0 w-full"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="min-w-0 rounded-card border border-fb-line bg-fb-card p-4 shadow-card">
        <p className="text-sm text-fb-ink-2">
          월 {formatCompactKrw(projection.monthlyFixedExpense)}의 고정비를{" "}
          {Math.round(config.periodMonths / 12)}년 동안 그대로 두면 단순 합산{" "}
          {formatCompactKrw(projection.simpleFixedCostTotal)}이고, 같은 돈을 연{" "}
          {Math.round(config.annualReturnRate * 100)}%로 굴렸다면{" "}
          {formatCompactKrw(projection.futureFixedCostImpact)} 차이가 생깁니다.
        </p>
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="fb-focus mt-4 rounded-button border border-fb-line bg-white px-4 py-2 text-sm font-bold text-fb-ink shadow-card"
        >
          결과 공유하기
        </button>
      </section>

      {shareOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-fb-trust/40 px-4">
          <div className="w-full max-w-md rounded-card bg-fb-card p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">결과 공유하기</h3>
              <button type="button" onClick={() => setShareOpen(false)} className="text-xl text-fb-ink-2">
                ×
              </button>
            </div>
            <div className="mt-4 rounded-soft bg-fb-trust p-4 text-white">
              <p className="text-sm text-white/75">매달 조용히 사라지는 돈</p>
              <p className="mt-2 text-3xl font-bold">
                {formatCompactKrw(projection.monthlyFixedExpense)}
              </p>
              <p className="mt-4 text-sm">
                {Math.round(config.periodMonths / 12)}년 후 +{formatCompactKrw(
                  projection.futureFixedCostImpact,
                )} 차이
              </p>
            </div>
            <button
              type="button"
              onClick={copyCurrentUrl}
              className="fb-focus mt-4 w-full rounded-button bg-fb-trust px-4 py-2 text-sm font-bold text-white shadow-card hover:bg-fb-trust-strong"
            >
              링크 복사
            </button>
            {copyMessage ? <p className="mt-2 text-sm text-fb-ink-2">{copyMessage}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ComparisonBar({
  label,
  value,
  max,
  trust = false,
}: {
  label: string;
  value: number;
  max: number;
  trust?: boolean;
}) {
  const height = Math.max(8, Math.round((value / max) * 64));

  return (
    <div className="flex min-w-0 flex-1 flex-col items-stretch justify-end">
      <div
        className={trust ? "rounded-[8px] bg-fb-trust" : "rounded-[8px] bg-fb-line-strong"}
        style={{ height }}
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className={trust ? "text-xs font-bold text-fb-trust" : "text-xs font-bold text-fb-ink-3"}>
          {label}
        </span>
        <span className="text-xs font-bold text-fb-ink">{formatCompactKrw(value)}</span>
      </div>
    </div>
  );
}
