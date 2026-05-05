"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import type { SaveFixedCostSimulationState } from "@/src/features/subscribe/actions/saveFixedCostSimulation";
import { fixedCostSimulationConfigSchema } from "@/src/features/subscribe/lib/fixedCostConfigSchema";
import { calculateFixedCostProjection } from "@/src/features/subscribe/lib/fixedCostSimulator";
import type { FixedCostSimulatorConfig } from "@/src/features/subscribe/lib/fixedCostTypes";
import { formatKrw } from "@/src/lib/format";

type SaveAction = (config: FixedCostSimulatorConfig) => Promise<SaveFixedCostSimulationState>;
type ApplyAction = (
  config: FixedCostSimulatorConfig,
) => Promise<{ applied?: boolean; error?: string }>;
const LOCAL_CONFIG_KEY = "fire-living-expense-adjuster-config";
type MoneyUnit = "won" | "thousand" | "man";
type CategoryDraft = { name: string; amount: string; unit: MoneyUnit };

const moneyUnitOptions: Array<{ value: MoneyUnit; label: string; multiplier: number }> = [
  { value: "won", label: "원", multiplier: 1 },
  { value: "thousand", label: "천원", multiplier: 1_000 },
  { value: "man", label: "만원", multiplier: 10_000 },
];

function getMoneyUnitMultiplier(unit: MoneyUnit) {
  return moneyUnitOptions.find((option) => option.value === unit)?.multiplier ?? 1;
}

function addThousandsSeparators(value: string) {
  const [integerPart, decimalPart] = value.replace(/,/g, "").split(".");
  const normalizedInteger = integerPart.replace(/[^\d-]/g, "");
  const formattedInteger = normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (decimalPart == null) {
    return formattedInteger;
  }

  return `${formattedInteger}.${decimalPart.replace(/[^\d]/g, "")}`;
}

function formatAmountInput(valueInWon: number, unit: MoneyUnit) {
  const displayValue = valueInWon / getMoneyUnitMultiplier(unit);
  const roundedDisplay =
    Number.isInteger(displayValue) ? String(displayValue) : displayValue.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  return addThousandsSeparators(roundedDisplay);
}

function parseAmountInput(value: string, unit: MoneyUnit) {
  const numberValue = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return 0;
  }

  return Math.round(numberValue * getMoneyUnitMultiplier(unit));
}

function formatDraftAmount(value: string) {
  return addThousandsSeparators(value);
}

function formatCompactKrw(value: number) {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1).replace(".0", "")}억`;
  }

  if (value >= 10_000) {
    return `${Math.round(value / 10_000).toLocaleString("ko-KR")}만`;
  }

  return formatKrw(value);
}

/** 만원 단위 정수 */
function toManWon(valueInWon: number) {
  return Math.round(valueInWon / 10_000);
}

function AmountInput({
  amountLabel,
  unitLabel,
  value,
  unit,
  onValueChange,
  onUnitChange,
  className = "",
}: {
  amountLabel: string;
  unitLabel: string;
  value: string;
  unit: MoneyUnit;
  onValueChange: (value: string) => void;
  onUnitChange: (unit: MoneyUnit) => void;
  className?: string;
}) {
  return (
    <div className={`grid min-w-0 grid-cols-[minmax(0,1fr)_92px] ${className}`}>
      <input
        aria-label={amountLabel}
        inputMode="decimal"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder="월 금액"
        className="fb-input min-w-0 w-full rounded-r-none border-r-0 px-3 py-2 text-sm"
      />
      <select
        aria-label={unitLabel}
        value={unit}
        onChange={(event) => onUnitChange(event.target.value as MoneyUnit)}
        className="fb-input min-w-0 w-full rounded-l-none px-2 py-2 text-sm font-bold"
      >
        {moneyUnitOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
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

/** Hero 4-tile 지표 카드 */
function MetricTile({
  label,
  valueWon,
  highlight,
  odId,
}: {
  label: string;
  valueWon: number;
  highlight?: boolean;
  odId: string;
}) {
  return (
    <div
      data-od-id={odId}
      className={`rounded-[14px] p-3 ${
        highlight
          ? "border border-[rgba(0,102,255,0.22)] bg-[#EAF2FE]"
          : "border border-[rgba(112,115,124,0.10)] bg-fb-card-alt"
      }`}
    >
      <div className="text-[11px] font-semibold text-fb-ink-3">{label}</div>
      <div className="fb-num mt-1 flex items-baseline gap-0.5">
        <span
          className={`text-[18px] font-bold tracking-[-0.012em] ${
            highlight ? "text-[#003B95]" : "text-fb-ink"
          }`}
        >
          {toManWon(valueWon).toLocaleString("ko-KR")}
        </span>
        <span className="text-[11px] font-semibold text-fb-ink-3">만원</span>
      </div>
    </div>
  );
}

export function FixedCostSimulator({
  initialConfig,
  saveAction,
  applyAction,
}: {
  initialConfig: FixedCostSimulatorConfig;
  saveAction: SaveAction;
  applyAction: ApplyAction;
}) {
  const [config, setConfig] = useState(() => {
    if (typeof window === "undefined") {
      return cloneConfig(initialConfig);
    }

    const savedConfig = window.localStorage.getItem(LOCAL_CONFIG_KEY);
    if (!savedConfig) {
      return cloneConfig(initialConfig);
    }

    try {
      const parsed = fixedCostSimulationConfigSchema.safeParse(JSON.parse(savedConfig));
      return parsed.success ? cloneConfig(parsed.data) : cloneConfig(initialConfig);
    } catch {
      window.localStorage.removeItem(LOCAL_CONFIG_KEY);
      return cloneConfig(initialConfig);
    }
  });
  const [shareOpen, setShareOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [amountUnits, setAmountUnits] = useState<Record<string, MoneyUnit>>({});
  const [customAmountUnit, setCustomAmountUnit] = useState<MoneyUnit>("won");
  const [customName, setCustomName] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, CategoryDraft>>({});
  const [openAddCategoryId, setOpenAddCategoryId] = useState<string | null>(null);
  const [openCategoryIds, setOpenCategoryIds] = useState<Set<string>>(() => new Set());
  const [fixedCostsOpen, setFixedCostsOpen] = useState(false);
  const [variableExpensesOpen, setVariableExpensesOpen] = useState(false);
  const [noteEditingItemKey, setNoteEditingItemKey] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveFixedCostSimulationState>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [applyState, setApplyState] = useState<{ applied?: boolean; error?: string }>({});
  const itemIdSequence = useRef(0);
  const [isPending, startTransition] = useTransition();
  const [isApplyPending, startApplyTransition] = useTransition();
  const projection = useMemo(() => calculateFixedCostProjection(config), [config]);
  const activeFixedCostCount = config.subscriptionCategories.reduce(
    (total, category) => total + category.items.filter((item) => item.enabled).length,
    0,
  );

  const baselineWon = config.dashboardBaseline?.targetMonthlyExpense ?? 0;
  const recommendedWon = projection.recommendedTargetMonthlyExpense;
  const diffMan = toManWon(recommendedWon) - toManWon(baselineWon);

  function updateConfig(updater: (next: FixedCostSimulatorConfig) => void) {
    setConfig((current) => {
      const next = cloneConfig(current);
      updater(next);
      return next;
    });
  }

  function getAmountUnit(key: string) {
    return amountUnits[key] ?? "won";
  }

  function setAmountUnit(key: string, unit: MoneyUnit) {
    setAmountUnits((current) => ({ ...current, [key]: unit }));
  }

  function toggleCategory(categoryId: string) {
    setOpenCategoryIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
    setOpenAddCategoryId((current) => (current === categoryId ? null : current));
  }

  function createItemId(prefix: string) {
    itemIdSequence.current += 1;
    return `${prefix}-${itemIdSequence.current}`;
  }

  async function copyCurrentUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyMessage("링크를 복사했어요.");
    } catch {
      setCopyMessage("복사 권한이 막혔어요. 주소창 URL을 직접 복사해주세요.");
    }
  }

  /** 초안 저장 — 대시보드 baseline은 변경하지 않음 */
  function save() {
    startTransition(async () => {
      const result = await saveAction(config);
      if (result.error === "로그인이 필요합니다.") {
        window.localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(config));
        setSaveState({ saved: true });
        setSaveMessage("이 브라우저에 저장했어요.");
        return;
      }

      if (result.saved) {
        window.localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(config));
        setSaveMessage("초안을 저장했어요 — 대시보드는 그대로예요.");
      } else {
        setSaveMessage(null);
      }
      setSaveState(result);
    });
  }

  /** 대시보드에 적용 — 이 버튼만 dashboard baseline을 갱신 */
  function applyRecommendation() {
    startApplyTransition(async () => {
      const result = await applyAction(config);
      setApplyState(result);
    });
  }

  function addCustomItem() {
    const name = customName.trim();
    const amount = parseAmountInput(customAmount, customAmountUnit);

    if (!name || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const itemId = createItemId("custom");

    updateConfig((next) => {
      const customCategory =
        next.subscriptionCategories.find((category) => category.id === "custom") ??
        next.subscriptionCategories[next.subscriptionCategories.length - 1];

      if (!customCategory) {
        return;
      }

      customCategory.items.push({
        id: itemId,
        name,
        monthlyAmount: amount,
        enabled: true,
      });
    });
    setAmountUnit(`custom:${itemId}`, customAmountUnit);
    setCustomName("");
    setCustomAmount("");
  }

  function addCategoryItem(categoryId: string) {
    const draft = categoryDrafts[categoryId] ?? { name: "", amount: "", unit: "won" };
    const name = draft.name.trim();
    const amount = parseAmountInput(draft.amount, draft.unit);

    if (!name || !Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const itemId = createItemId(categoryId);

    updateConfig((next) => {
      const targetCategory = next.subscriptionCategories.find((category) => category.id === categoryId);
      targetCategory?.items.push({
        id: itemId,
        name,
        monthlyAmount: amount,
        enabled: true,
      });
    });
    setAmountUnit(`${categoryId}:${itemId}`, draft.unit);
    setCategoryDrafts((current) => ({ ...current, [categoryId]: { name: "", amount: "", unit: "won" } }));
    setOpenAddCategoryId(null);
  }

  function deleteCategoryItem(categoryId: string, itemId: string) {
    updateConfig((next) => {
      const targetCategory = next.subscriptionCategories.find((category) => category.id === categoryId);
      if (targetCategory) {
        targetCategory.items = targetCategory.items.filter((item) => item.id !== itemId);
      }
    });
  }

  return (
    <div className="grid gap-4">
      {/* ── Hero — 4-tile metrics + active count + 대시보드 대비 ─── */}
      <div data-od-id="hero-recommended-expense" className="rounded-[24px] border border-fb-line bg-fb-card p-6 shadow-card">
        <div className="text-[12px] font-bold tracking-[-0.005em] text-fb-trust">
          FIRE 생활비 조정기
        </div>
        <h1 className="mt-1 text-[22px] font-bold leading-[1.30] tracking-[-0.020em] text-fb-ink">
          목표 월 생활비를 현실적인<br />생활 수준으로 조정해요
        </h1>

        {/* 4-tile summary */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <MetricTile
            odId="summary-fixed"
            label="월 고정비"
            valueWon={projection.monthlyRecurringFixedExpense}
          />
          <MetricTile
            odId="summary-variable"
            label="월 변동비"
            valueWon={projection.monthlyVariableExpense}
          />
          <MetricTile
            odId="summary-buffer"
            label="버퍼"
            valueWon={projection.monthlyBufferExpense}
          />
          <MetricTile
            odId="summary-recommended"
            label="계산된 월 생활비"
            valueWon={projection.recommendedTargetMonthlyExpense}
            highlight
          />
        </div>

        {/* 대시보드 기준 vs 권장 차이 */}
        <div data-od-id="summary-difference" className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-medium text-fb-ink-3">
            대시보드 기준 {toManWon(baselineWon).toLocaleString("ko-KR")}만원 대비
          </span>
          <span
            className={`fb-num rounded-full px-2 py-0.5 text-[13px] font-bold ${
              diffMan === 0
                ? "bg-fb-card-alt text-fb-ink-3"
                : diffMan > 0
                  ? "bg-[#FFF7F0] text-[#9C5612]"
                  : "bg-[rgba(0,166,56,0.10)] text-[#006B25]"
            }`}
          >
            {diffMan === 0
              ? "±0"
              : diffMan > 0
                ? `+${diffMan.toLocaleString("ko-KR")}만원`
                : `${diffMan.toLocaleString("ko-KR")}만원`}
          </span>
        </div>

        {/* 활성 고정비 N개 */}
        <div className="mt-4 rounded-[14px] border border-[rgba(112,115,124,0.10)] bg-fb-card-alt px-3.5 py-3">
          <div className="fb-num text-[13px] font-bold text-fb-ink">
            활성 고정비 {activeFixedCostCount}개
          </div>
          <div className="mt-1 text-[12px] font-medium leading-[1.5] text-fb-ink-2">
            대시보드 수익률은 연 5% 기준으로 고정하고, 이 화면에서는 생활비 구성만 조정해요.
          </div>
        </div>

        {/* Feedback messages */}
        {saveState.error ? (
          <p className="mt-3 text-sm text-fb-negative">{saveState.error}</p>
        ) : null}
        {saveState.saved && saveMessage ? (
          <p className="mt-3 text-sm text-fb-positive">{saveMessage}</p>
        ) : null}
        {applyState.error ? (
          <p className="mt-3 text-sm text-fb-negative">{applyState.error}</p>
        ) : null}
        {applyState.applied ? (
          <p className="mt-3 text-sm text-fb-positive">대시보드에 적용했어요.</p>
        ) : null}
      </div>

      {/* ── 고정비 (collapsible) ──────────────────────────────── */}
      <div data-od-id="group-fixed-categories" className="rounded-card border border-fb-line bg-fb-card p-5 shadow-card">
        <button
          type="button"
          aria-expanded={fixedCostsOpen}
          onClick={() => setFixedCostsOpen((current) => !current)}
          className="fb-focus flex w-full min-w-0 items-center justify-between gap-3 text-left"
        >
          <span className="min-w-0">
            <span className="block text-[18px] font-bold tracking-[-0.012em] text-fb-ink">고정비</span>
            <span className="fb-num mt-1 block text-[13px] font-bold text-fb-trust">
              {formatKrw(projection.monthlyRecurringFixedExpense)}
            </span>
          </span>
          <span className="shrink-0 text-xs font-bold text-fb-ink-3">
            {fixedCostsOpen ? "접기" : "펼치기"}
          </span>
        </button>

        {fixedCostsOpen ? (
          <div className="mt-3.5 grid min-w-0 gap-2.5">
            <p className="text-[13px] font-medium leading-[1.5] text-fb-ink-2">
              반복 지출을 켜거나 금액을 바꾸면 추천 생활비가 바로 바뀝니다.
            </p>
            {config.subscriptionCategories.map((category) => {
              const categoryTotal = category.items.reduce(
                (total, item) => total + (item.enabled ? item.monthlyAmount : 0),
                0,
              );
              const categoryDraft = categoryDrafts[category.id] ?? {
                name: "",
                amount: "",
                unit: "won",
              };
              const categoryOpen = openCategoryIds.has(category.id);

              return (
                <div
                  key={category.id}
                  className="min-w-0 rounded-[14px] border border-[rgba(112,115,124,0.18)] bg-white p-3.5"
                >
                  <button
                    type="button"
                    aria-expanded={categoryOpen}
                    onClick={() => toggleCategory(category.id)}
                    className="fb-focus flex w-full min-w-0 items-center justify-between gap-3 text-left"
                  >
                    <span className="min-w-0">
                      <span className="block text-[14px] font-bold text-fb-ink">{category.name}</span>
                      <span className="fb-num mt-0.5 block text-[12px] font-bold text-fb-trust">
                        {formatKrw(categoryTotal)}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-bold text-fb-ink-3">
                      {categoryOpen ? "접기" : "펼치기"}
                    </span>
                  </button>

                  {categoryOpen ? (
                    <>
                      <p className="mt-3 text-[12px] font-medium leading-[1.5] text-fb-ink-2">
                        {category.prompt}
                      </p>

                      {/* Add button */}
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenAddCategoryId((current) =>
                              current === category.id ? null : category.id,
                            )
                          }
                          className="fb-focus rounded-button border border-fb-line bg-white px-3 py-2 text-xs font-bold text-fb-ink"
                        >
                          {category.name} 추가
                        </button>
                      </div>

                      {/* Add form */}
                      {openAddCategoryId === category.id ? (
                        <div className="mt-3 grid min-w-0 gap-2 rounded-soft border border-dashed border-fb-line-strong bg-fb-card-alt p-3">
                          <input
                            aria-label={`${category.name} 새 항목명`}
                            value={categoryDraft.name}
                            onChange={(event) =>
                              setCategoryDrafts((current) => ({
                                ...current,
                                [category.id]: {
                                  amount: current[category.id]?.amount ?? "",
                                  unit: current[category.id]?.unit ?? "won",
                                  name: event.target.value,
                                },
                              }))
                            }
                            placeholder="항목명"
                            className="fb-input min-w-0 w-full px-3 py-2 text-sm"
                          />
                          <AmountInput
                            amountLabel={`${category.name} 새 월 금액`}
                            unitLabel={`${category.name} 새 금액 단위`}
                            value={categoryDraft.amount}
                            unit={categoryDraft.unit}
                            onValueChange={(value) =>
                              setCategoryDrafts((current) => ({
                                ...current,
                                [category.id]: {
                                  amount: formatDraftAmount(value),
                                  unit: current[category.id]?.unit ?? "won",
                                  name: current[category.id]?.name ?? "",
                                },
                              }))
                            }
                            onUnitChange={(unit) =>
                              setCategoryDrafts((current) => ({
                                ...current,
                                [category.id]: {
                                  amount: current[category.id]?.amount ?? "",
                                  name: current[category.id]?.name ?? "",
                                  unit,
                                },
                              }))
                            }
                          />
                          <button
                            type="button"
                            onClick={() => addCategoryItem(category.id)}
                            className="fb-focus rounded-button bg-fb-ink px-4 py-2 text-sm font-bold text-white"
                          >
                            {category.name} 항목 저장
                          </button>
                        </div>
                      ) : null}

                      {/* 항목 리스트 */}
                      <div className="mt-3 grid min-w-0 gap-2">
                        {category.items.map((item) => {
                          const itemKey = `${category.id}:${item.id}`;
                          const noteOpen = noteEditingItemKey === itemKey || Boolean(item.note);
                          const itemAmountUnit = getAmountUnit(itemKey);

                          return (
                            <div
                              key={item.id}
                              className={`grid min-w-0 gap-2 rounded-[10px] border p-2.5 ${
                                item.enabled
                                  ? "border-[rgba(0,102,255,0.22)] bg-[rgba(0,102,255,0.04)]"
                                  : "border-fb-line bg-white"
                              }`}
                            >
                              <div className="flex min-w-0 items-center justify-between gap-2">
                                {/* Toggle-toggle button (click name toggles enabled) */}
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
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    aria-label={`${item.name} 삭제`}
                                    onClick={() => deleteCategoryItem(category.id, item.id)}
                                    className="fb-focus rounded-full border border-fb-line bg-white px-2 py-1 text-xs font-bold text-fb-ink-2"
                                  >
                                    삭제
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`${item.name} 메모 편집`}
                                    onClick={() =>
                                      setNoteEditingItemKey((current) =>
                                        current === itemKey ? null : itemKey,
                                      )
                                    }
                                    className="fb-focus flex size-7 items-center justify-center rounded-full border border-fb-line bg-white text-sm font-bold text-fb-ink-2"
                                  >
                                    ✎
                                  </button>
                                </div>
                              </div>
                              <AmountInput
                                amountLabel={`${item.name} 월 금액`}
                                unitLabel={`${item.name} 금액 단위`}
                                value={formatAmountInput(item.monthlyAmount, itemAmountUnit)}
                                unit={itemAmountUnit}
                                onValueChange={(value) =>
                                  updateConfig((next) => {
                                    const targetCategory = next.subscriptionCategories.find(
                                      (candidate) => candidate.id === category.id,
                                    );
                                    const targetItem = targetCategory?.items.find(
                                      (candidate) => candidate.id === item.id,
                                    );
                                    if (targetItem) {
                                      targetItem.monthlyAmount = parseAmountInput(
                                        value,
                                        itemAmountUnit,
                                      );
                                    }
                                  })
                                }
                                onUnitChange={(unit) => setAmountUnit(itemKey, unit)}
                                className="gap-0"
                              />
                              {noteOpen ? (
                                <label className="grid min-w-0 gap-1">
                                  <span className="text-xs font-medium text-fb-ink-2">메모</span>
                                  <textarea
                                    aria-label={`${item.name} 메모`}
                                    value={item.note ?? ""}
                                    onChange={(event) =>
                                      updateConfig((next) => {
                                        const targetCategory = next.subscriptionCategories.find(
                                          (candidate) => candidate.id === category.id,
                                        );
                                        const targetItem = targetCategory?.items.find(
                                          (candidate) => candidate.id === item.id,
                                        );
                                        if (targetItem) {
                                          targetItem.note = event.target.value;
                                        }
                                      })
                                    }
                                    placeholder="메모"
                                    className="fb-input min-h-20 min-w-0 w-full resize-none px-2 py-2 text-sm"
                                  />
                                </label>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>

                      {/* Custom category 직접 추가 */}
                      {category.id === "custom" ? (
                        <div className="mt-3 grid min-w-0 gap-2 rounded-soft border border-dashed border-fb-line-strong bg-white p-3">
                          <input
                            aria-label="직접 추가 항목명"
                            value={customName}
                            onChange={(event) => setCustomName(event.target.value)}
                            placeholder="예: 주차 정기권"
                            className="fb-input min-w-0 w-full px-3 py-2 text-sm"
                          />
                          <AmountInput
                            amountLabel="직접 추가 월 금액"
                            unitLabel="직접 추가 금액 단위"
                            value={customAmount}
                            unit={customAmountUnit}
                            onValueChange={(value) => setCustomAmount(formatDraftAmount(value))}
                            onUnitChange={setCustomAmountUnit}
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
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* ── 변동비 (collapsible) ──────────────────────────────── */}
      <div data-od-id="group-variable-groups" className="rounded-card border border-fb-line bg-fb-card p-5 shadow-card">
        <button
          type="button"
          aria-expanded={variableExpensesOpen}
          onClick={() => setVariableExpensesOpen((current) => !current)}
          className="fb-focus flex w-full min-w-0 items-center justify-between gap-3 text-left"
        >
          <span className="min-w-0">
            <span className="block text-[18px] font-bold tracking-[-0.012em] text-fb-ink">변동비</span>
            <span className="fb-num mt-1 block text-[13px] font-bold text-fb-trust">
              {formatKrw(projection.monthlyVariableExpense)}
            </span>
          </span>
          <span className="shrink-0 text-xs font-bold text-fb-ink-3">
            {variableExpensesOpen ? "접기" : "펼치기"}
          </span>
        </button>

        {variableExpensesOpen ? (
          <div className="mt-3.5 grid min-w-0 gap-3">
            {config.livingExpenses.map((item) => {
              const itemKey = `living:${item.id}`;
              const itemAmountUnit = getAmountUnit(itemKey);

              return (
                <div key={item.id} className="grid min-w-0 gap-2">
                  <p className="text-sm font-medium text-fb-ink-2">{item.name}</p>
                  <AmountInput
                    amountLabel={`${item.name} 월 금액`}
                    unitLabel={`${item.name} 금액 단위`}
                    value={formatAmountInput(item.monthlyAmount, itemAmountUnit)}
                    unit={itemAmountUnit}
                    onValueChange={(value) =>
                      updateConfig((next) => {
                        const target = next.livingExpenses.find(
                          (candidate) => candidate.id === item.id,
                        );
                        if (target) {
                          target.monthlyAmount = parseAmountInput(value, itemAmountUnit);
                        }
                      })
                    }
                    onUnitChange={(unit) => setAmountUnit(itemKey, unit)}
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* ── 버퍼 ─────────────────────────────────────────────── */}
      <section className="rounded-card border border-fb-line bg-fb-card p-5 shadow-card">
        <h2 className="text-[18px] font-bold tracking-[-0.012em] text-fb-ink">버퍼</h2>
        <p className="mt-1 text-[12px] font-medium leading-[1.5] text-fb-ink-2">
          예상치 못한 지출에 대비하는 월 단위 여유분. 고정·변동 합계 기준으로 빠르게 설정할 수도 있어요.
        </p>

        <div data-od-id="input-buffer" className="mt-3.5 grid min-w-0 gap-2">
          <AmountInput
            amountLabel="버퍼 금액"
            unitLabel="버퍼 금액 단위"
            value={formatAmountInput(config.bufferMonthlyAmount, getAmountUnit("buffer"))}
            unit={getAmountUnit("buffer")}
            onValueChange={(value) =>
              updateConfig((next) => {
                next.bufferMonthlyAmount = parseAmountInput(value, getAmountUnit("buffer"));
              })
            }
            onUnitChange={(unit) => setAmountUnit("buffer", unit)}
          />
          <div className="flex gap-1.5">
            {[0, 5, 10, 15].map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() =>
                  updateConfig((next) => {
                    const base =
                      next.subscriptionCategories.reduce(
                        (categoryTotal, category) =>
                          categoryTotal +
                          category.items.reduce(
                            (itemTotal, item) =>
                              itemTotal + (item.enabled ? item.monthlyAmount : 0),
                            0,
                          ),
                        0,
                      ) +
                      next.livingExpenses.reduce(
                        (total, item) => total + Math.max(item.monthlyAmount, 0),
                        0,
                      );
                    next.bufferMonthlyAmount = Math.round(base * (percent / 100));
                  })
                }
                className="fb-focus flex-1 rounded-full border border-[rgba(112,115,124,0.22)] bg-white py-[7px] text-[12px] font-bold text-fb-ink"
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 면책 안내 + 공유 ──────────────────────────────────── */}
      <section className="rounded-card border border-fb-line bg-fb-card p-4 shadow-card">
        <p className="text-sm text-fb-ink-2">
          계산된 월 생활비는 고정비, 변동비, 버퍼를 더한 값입니다. 적용 전까지 대시보드
          기준값은 바뀌지 않습니다.
        </p>
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="fb-focus mt-4 rounded-button border border-fb-line bg-white px-4 py-2 text-sm font-bold text-fb-ink shadow-card"
        >
          결과 공유하기
        </button>
      </section>

      {/* ── CTA 버튼 — 초안 저장 vs 대시보드에 적용 (PRD 분리 룰) ── */}
      <div className="grid grid-cols-2 gap-2.5">
        <div data-od-id="cta-save-draft">
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="fb-focus h-[54px] w-full rounded-button border border-[rgba(112,115,124,0.32)] bg-white text-[15px] font-bold text-fb-ink disabled:opacity-60"
          >
            {isPending ? "저장 중..." : "저장"}
          </button>
        </div>
        <div data-od-id="cta-apply-baseline">
          <button
            type="button"
            onClick={applyRecommendation}
            disabled={isApplyPending}
            className="fb-focus h-[54px] w-full rounded-button bg-fb-trust text-[15px] font-bold tracking-[-0.008em] text-white hover:bg-fb-trust-strong disabled:opacity-60"
          >
            {isApplyPending ? "적용 중..." : "추천값 적용"}
          </button>
        </div>
      </div>

      {/* bottom-nav OD marker */}
      <div data-od-id="bottom-nav" />

      {/* ── 공유 모달 ─────────────────────────────────────────── */}
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
              <p className="text-sm text-white/75">계산된 월 생활비</p>
              <p className="mt-2 text-3xl font-bold">
                {formatCompactKrw(projection.recommendedTargetMonthlyExpense)}
              </p>
              <p className="mt-4 text-sm">
                고정비, 변동비, 버퍼를 합친 계산된 월 생활비입니다.
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
