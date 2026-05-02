"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, SectionHeader, StatusPill } from "@/components/fire-banking";
import { deleteHolding as deleteHoldingAction } from "@/src/features/assets/actions/deleteHolding";
import { saveKnownDomesticHolding } from "@/src/features/assets/actions/saveKnownDomesticHolding";
import { updateHolding } from "@/src/features/assets/actions/updateHolding";
import { formatKrw } from "@/src/lib/format";

export type HoldingView = {
  id: string;
  symbol: string;
  displayName: string;
  quantity: number;
  valuationAmount: number;
  valuationDate: string;
  accountCategory?: "general" | "pension_savings" | "irp" | "other";
};

const defaultHoldings: HoldingView[] = [
  {
    id: "sample-samsung",
    symbol: "005930",
    displayName: "삼성전자",
    quantity: 18,
    valuationAmount: 1_530_000,
    valuationDate: "2026-05-29",
  },
];

const recommendations = [
  "TIGER 미국S&P500",
  "KODEX 미국나스닥100",
  "ACE 미국배당다우존스",
  "SOL 미국배당다우존스",
];

const searchableInstruments = [
  {
    id: "sample-samsung",
    symbol: "005930",
    displayName: "삼성전자",
    quantity: 18,
    valuationAmount: 1_530_000,
    valuationDate: "2026-05-29",
  },
  {
    id: "sample-tiger-sp500",
    symbol: "360750",
    displayName: "TIGER 미국S&P500",
    quantity: 10,
    valuationAmount: 210_000,
    valuationDate: "2026-05-29",
  },
  {
    id: "sample-kodex-nasdaq",
    symbol: "379810",
    displayName: "KODEX 미국나스닥100",
    quantity: 10,
    valuationAmount: 185_000,
    valuationDate: "2026-05-29",
  },
];

export function InvestmentAssetPanel({
  coupleId,
  holdings = defaultHoldings,
}: {
  coupleId?: string | null;
  holdings?: HoldingView[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(holdings);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState("");
  const total = items.reduce((sum, holding) => sum + holding.valuationAmount, 0);
  const searchResults = useMemo(() => {
    const normalized = submittedQuery.trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    return searchableInstruments.filter(
      (instrument) =>
        instrument.displayName.toLowerCase().includes(normalized) ||
        instrument.symbol.includes(normalized),
    );
  }, [submittedQuery]);

  const handleSearch = () => {
    setSubmittedQuery(query);
  };

  const searchRecommended = (instrumentName: string) => {
    setQuery(instrumentName);
    setSubmittedQuery(instrumentName);
  };

  const addHolding = (holding: HoldingView) => {
    if (items.some((item) => item.symbol === holding.symbol)) {
      return;
    }

    if (coupleId) {
      const formData = new FormData();
      formData.set("coupleId", coupleId);
      formData.set("symbol", holding.symbol);
      formData.set("quantity", String(holding.quantity));
      formData.set("accountCategory", "general");
      startTransition(async () => {
        const result = await saveKnownDomesticHolding({}, formData);
        if (result.success) {
          router.refresh();
        }
      });
      return;
    }

    setItems((current) => {
      if (current.some((item) => item.symbol === holding.symbol)) {
        return current;
      }

      return [...current, holding];
    });
  };

  const startEdit = (holding: HoldingView) => {
    setEditingId(holding.id);
    setEditingQuantity(String(holding.quantity));
  };

  const saveQuantity = (holdingId: string) => {
    const nextQuantity = Number(editingQuantity);

    if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === holdingId
          ? {
              ...item,
              quantity: nextQuantity,
              valuationAmount: Math.round((item.valuationAmount / item.quantity) * nextQuantity),
            }
          : item,
      ),
    );
    setEditingId(null);
    setEditingQuantity("");

    if (coupleId) {
      const current = items.find((item) => item.id === holdingId);
      const formData = new FormData();
      formData.set("coupleId", coupleId);
      formData.set("holdingId", holdingId);
      formData.set("quantity", String(nextQuantity));
      formData.set("accountCategory", current?.accountCategory ?? "general");
      startTransition(async () => {
        const result = await updateHolding({}, formData);
        if (result.success) {
          router.refresh();
        }
      });
    }
  };

  const deleteHolding = (holdingId: string) => {
    setItems((current) => current.filter((item) => item.id !== holdingId));

    if (coupleId) {
      const formData = new FormData();
      formData.set("coupleId", coupleId);
      formData.set("holdingId", holdingId);
      startTransition(async () => {
        const result = await deleteHoldingAction({}, formData);
        if (result.success) {
          router.refresh();
        }
      });
    }
  };

  return (
    <Card className="p-5 md:p-6">
      <SectionHeader
        title="투자자산"
        subtitle="국내주식과 국내 ETF를 종목별로 자동 계산해요."
        action={<StatusPill label={isPending ? "저장 중" : "국내 상장 우선"} status="info" />}
      />

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[16px] border border-fb-line bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-bold text-fb-ink">종목 검색</p>
              <p className="mt-1 text-[12px] leading-5 text-fb-ink-3">
                자동 시세는 국내 상장 종목부터 지원해요.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="domestic-instrument-query">
              종목 검색어
            </label>
            <input
              id="domestic-instrument-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearch();
                }
              }}
              className="h-10 rounded-[10px] border border-fb-line bg-white px-3 text-[13px] font-medium text-fb-ink outline-none focus:border-fb-trust"
              placeholder="삼성전자, 005930, TIGER..."
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleSearch}>
              검색
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {recommendations.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => searchRecommended(item)}
                className="fbpress rounded-full border border-fb-line bg-fb-card-alt px-3 py-1.5 text-[12px] font-semibold text-fb-ink-2 hover:bg-white"
              >
                {item}
              </button>
            ))}
          </div>

          {submittedQuery ? (
            <div className="mt-4 grid gap-2">
              {searchResults.length === 0 ? (
                <p className="rounded-[12px] bg-fb-card-alt px-3 py-3 text-[13px] font-medium text-fb-ink-3">
                  검색 결과가 없어요.
                </p>
              ) : (
                searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between gap-3 rounded-[12px] border border-fb-line bg-fb-card-alt px-3 py-2"
                  >
                    <div>
                      <p className="text-[13px] font-bold text-fb-ink">{result.displayName}</p>
                      <p className="mt-0.5 text-[12px] text-fb-ink-3">{result.symbol}</p>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={() => addHolding(result)}>
                      {result.displayName} 추가
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : null}

          <div className="mt-5 border-t border-fb-line pt-4">
            {items.length === 0 ? (
              <p className="rounded-[12px] bg-fb-card-alt px-3 py-3 text-[13px] font-medium text-fb-ink-3">
                아직 등록한 종목이 없어요.
              </p>
            ) : (
              <div className="grid gap-3">
                {items.map((holding) => (
                  <div
                    key={holding.id}
                    className="grid gap-3 rounded-[12px] border border-fb-line bg-white p-3 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="text-[14px] font-bold text-fb-ink">{holding.displayName}</p>
                      {editingId === holding.id ? (
                        <div className="mt-2 flex items-center gap-2">
                          <label className="sr-only" htmlFor={`${holding.id}-quantity`}>
                            {holding.displayName} 보유 수량
                          </label>
                          <input
                            id={`${holding.id}-quantity`}
                            value={editingQuantity}
                            onChange={(event) => setEditingQuantity(event.target.value)}
                            className="h-9 w-24 rounded-[10px] border border-fb-line bg-white px-3 text-[13px] font-semibold text-fb-ink outline-none focus:border-fb-trust"
                            inputMode="decimal"
                          />
                          <span className="text-[12px] font-medium text-fb-ink-3">주</span>
                        </div>
                      ) : (
                        <p className="mt-1 text-[12px] text-fb-ink-3">
                          {holding.symbol} · {holding.quantity.toLocaleString("ko-KR")}주 · 마지막 거래일{" "}
                          {holding.valuationDate} 기준
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <p className="fb-num text-[15px] font-bold text-fb-ink">
                        {formatKrw(holding.valuationAmount)}
                      </p>
                      <div className="flex gap-1.5">
                        {editingId === holding.id ? (
                          <Button type="button" variant="secondary" size="sm" onClick={() => saveQuantity(holding.id)}>
                            저장
                          </Button>
                        ) : (
                          <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(holding)}>
                            수량 수정
                          </Button>
                        )}
                        <Button type="button" variant="dangerSoft" size="sm" onClick={() => deleteHolding(holding.id)}>
                          삭제
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[16px] border border-fb-line bg-fb-card-alt p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[13px] font-bold text-fb-ink">미국상장 수동 계산</p>
            <p className="fb-num text-[15px] font-bold text-fb-trust">{formatKrw(total)}</p>
          </div>
          <p className="mt-2 text-[12px] leading-5 text-fb-ink-3">
            미국상장 ETF는 이번 버전에서 가격과 환율을 직접 넣어 원화 평가액만 계산해요.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-[12px] font-semibold text-fb-ink-2">
            {["티커/이름", "보유 수량", "1주 가격(USD)", "적용 환율", "계산된 원화 평가액"].map((label) => (
              <div key={label} className="rounded-[10px] border border-fb-line bg-white px-3 py-2">
                {label}
              </div>
            ))}
          </div>

          <p className="mt-4 rounded-[12px] bg-white px-3 py-3 text-[12px] leading-5 text-fb-ink-3">
            연금저축/IRP는 표시 순자산에는 포함하고 기본 FIRE 계산에서는 제외해요.
          </p>
        </section>
      </div>
    </Card>
  );
}
