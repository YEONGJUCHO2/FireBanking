"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, SectionHeader, StatusPill } from "@/components/fire-banking";
import { deleteHolding as deleteHoldingAction } from "@/src/features/assets/actions/deleteHolding";
import { saveHolding } from "@/src/features/assets/actions/saveHolding";
import { saveKnownDomesticHolding } from "@/src/features/assets/actions/saveKnownDomesticHolding";
import { searchDomesticInstruments } from "@/src/features/assets/actions/searchDomesticInstruments";
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

type AccountCategory = NonNullable<HoldingView["accountCategory"]>;

type SearchableHoldingView = HoldingView & {
  instrumentId?: string;
  lastClosePrice?: number;
  lastCloseDate?: string;
};

type OverseasManualHolding = {
  id: string;
  name: string;
  quantity: number;
  usdPrice: number;
  exchangeRate: number;
  valuationAmount: number;
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

const SEARCH_RESULTS_PAGE_SIZE = 3;
const DEMO_HOLDINGS_COOKIE = "fb_demo_asset_holdings";

const accountCategoryOptions: Array<{ value: AccountCategory; label: string }> = [
  { value: "general", label: "일반" },
  { value: "pension_savings", label: "연금저축" },
  { value: "irp", label: "IRP" },
  { value: "other", label: "기타" },
];

const accountCategoryLabels: Record<AccountCategory, string> = {
  general: "일반",
  pension_savings: "연금저축",
  irp: "IRP",
  other: "기타",
};

const accountSections: Array<{ value: AccountCategory; title: string }> = [
  { value: "general", title: "일반 계좌" },
  { value: "pension_savings", title: "연금저축" },
  { value: "irp", title: "IRP" },
  { value: "other", title: "기타" },
];

function getUnitPrice(holding: HoldingView) {
  const searchableHolding = holding as SearchableHoldingView;

  if (searchableHolding.lastClosePrice && searchableHolding.lastClosePrice > 0) {
    return searchableHolding.lastClosePrice;
  }

  if (holding.quantity > 0) {
    return Math.round(holding.valuationAmount / holding.quantity);
  }

  return 0;
}

function getDiagnosisCategoryLabel(accountCategory: AccountCategory) {
  return accountCategory === "pension_savings" || accountCategory === "irp"
    ? "제한·미래 자산"
    : "FIRE 반영";
}

const searchableInstruments: SearchableHoldingView[] = [
  {
    id: "sample-samsung",
    symbol: "005930",
    displayName: "삼성전자",
    quantity: 18,
    valuationAmount: 1_530_000,
    valuationDate: "2026-05-29",
    lastClosePrice: 85_000,
  },
  {
    id: "sample-tiger-sp500",
    symbol: "360750",
    displayName: "TIGER 미국S&P500",
    quantity: 10,
    valuationAmount: 210_000,
    valuationDate: "2026-05-29",
    lastClosePrice: 21_000,
  },
  {
    id: "sample-kodex-nasdaq",
    symbol: "379810",
    displayName: "KODEX 미국나스닥100",
    quantity: 10,
    valuationAmount: 185_000,
    valuationDate: "2026-05-29",
    lastClosePrice: 18_500,
  },
  {
    id: "sample-posco-future-m",
    symbol: "003670",
    displayName: "포스코퓨처엠",
    quantity: 1,
    valuationAmount: 250_000,
    valuationDate: "2026-05-29",
    lastClosePrice: 250_000,
  },
  {
    id: "sample-posco-holdings",
    symbol: "005490",
    displayName: "포스코홀딩스",
    quantity: 1,
    valuationAmount: 370_000,
    valuationDate: "2026-05-29",
    lastClosePrice: 370_000,
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
  const [serverSearchResults, setServerSearchResults] = useState<SearchableHoldingView[] | null>(
    null,
  );
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchPage, setSearchPage] = useState(0);
  const [addQuantity, setAddQuantity] = useState("1");
  const [addAccountCategory, setAddAccountCategory] = useState<AccountCategory>("general");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState("");
  const [overseasName, setOverseasName] = useState("");
  const [overseasQuantity, setOverseasQuantity] = useState("");
  const [overseasUsdPrice, setOverseasUsdPrice] = useState("");
  const [overseasExchangeRate, setOverseasExchangeRate] = useState("");
  const [overseasHoldings, setOverseasHoldings] = useState<OverseasManualHolding[]>([]);
  const searchRequestId = useRef(0);
  const searchDebounceId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localSearchResults = useMemo(() => {
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
  const searchResults = serverSearchResults ?? localSearchResults;
  const totalSearchPages = Math.max(1, Math.ceil(searchResults.length / SEARCH_RESULTS_PAGE_SIZE));
  const visibleSearchResults = searchResults.slice(
    searchPage * SEARCH_RESULTS_PAGE_SIZE,
    searchPage * SEARCH_RESULTS_PAGE_SIZE + SEARCH_RESULTS_PAGE_SIZE,
  );
  const groupedHoldings = useMemo(
    () =>
      accountSections.map((section) => ({
        ...section,
        holdings: items.filter((item) => (item.accountCategory ?? "general") === section.value),
      })),
    [items],
  );
  const overseasManualValuation = calculateOverseasManualValuation(
    overseasQuantity,
    overseasUsdPrice,
    overseasExchangeRate,
  );

  useEffect(() => {
    return () => {
      if (searchDebounceId.current) {
        clearTimeout(searchDebounceId.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!coupleId) {
      persistDemoHoldings(items);
    }
  }, [coupleId, items]);

  const runSearch = (nextQuery: string, options: { defer?: boolean } = {}) => {
    const normalizedQuery = nextQuery.trim();

    if (searchDebounceId.current) {
      clearTimeout(searchDebounceId.current);
      searchDebounceId.current = null;
    }

    setServerSearchResults(null);
    setSearchError(null);
    setSubmittedQuery(nextQuery);
    setSearchPage(0);

    if (!normalizedQuery) {
      searchRequestId.current += 1;
      return;
    }

    if (options.defer) {
      searchDebounceId.current = setTimeout(() => {
        runSearch(normalizedQuery);
      }, 350);
      return;
    }

    const formData = new FormData();
    formData.set("query", normalizedQuery);
    const requestId = searchRequestId.current + 1;
    searchRequestId.current = requestId;

    startTransition(async () => {
      const result = await searchDomesticInstruments({}, formData);

      if (requestId !== searchRequestId.current) {
        return;
      }

      if (!result) {
        return;
      }

      if (result.error) {
        setSearchError(result.error);
        setServerSearchResults(null);
        return;
      }

      setSearchError(null);
      setServerSearchResults(
        (result.instruments ?? []).map((instrument) => ({
          id: `search-${instrument.symbol}`,
          instrumentId: coupleId ? instrument.id : undefined,
          symbol: instrument.symbol,
          displayName: instrument.displayName,
          lastClosePrice: instrument.lastClosePrice,
          lastCloseDate: instrument.lastCloseDate,
          quantity: 1,
          valuationAmount: 0,
          valuationDate: "가격 확인 중",
        })),
      );
    });
  };

  const handleSearch = () => runSearch(query);

  const addHolding = (holding: SearchableHoldingView) => {
    const nextQuantity = Number(addQuantity);

    if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
      return;
    }

    if (items.some((item) => item.symbol === holding.symbol)) {
      return;
    }

    if (coupleId) {
      const formData = new FormData();
      formData.set("coupleId", coupleId);
      formData.set("quantity", String(nextQuantity));
      formData.set("accountCategory", addAccountCategory);
      formData.set(holding.instrumentId ? "instrumentId" : "symbol", holding.instrumentId ?? holding.symbol);
      startTransition(async () => {
        const result = holding.instrumentId
          ? await saveHolding({}, formData)
          : await saveKnownDomesticHolding({}, formData);
        if (result.success) {
          router.refresh();
        }
      });
      return;
    }

    setQuery("");
    setSubmittedQuery("");
    setServerSearchResults(null);
    setSearchError(null);

    setItems((current) => {
      if (current.some((item) => item.symbol === holding.symbol)) {
        return current;
      }

      const unitPrice = holding.lastClosePrice ?? holding.valuationAmount / holding.quantity;

      return [
        ...current,
        {
          ...holding,
          quantity: nextQuantity,
          valuationAmount: Math.round(unitPrice * nextQuantity),
          accountCategory: addAccountCategory,
        },
      ];
    });
  };

  const addOverseasManualHolding = () => {
    const trimmedName = overseasName.trim().toUpperCase();

    if (!trimmedName || overseasManualValuation <= 0) {
      return;
    }

    const quantity = parsePositiveNumber(overseasQuantity);
    const usdPrice = parsePositiveNumber(overseasUsdPrice);
    const exchangeRate = parsePositiveNumber(overseasExchangeRate);

    if (!quantity || !usdPrice || !exchangeRate) {
      return;
    }

    setOverseasHoldings((current) => [
      ...current,
      {
        id: `${trimmedName}-${Date.now()}`,
        name: trimmedName,
        quantity,
        usdPrice,
        exchangeRate,
        valuationAmount: overseasManualValuation,
      },
    ]);
    setOverseasName("");
    setOverseasQuantity("");
    setOverseasUsdPrice("");
    setOverseasExchangeRate("");
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

      <div className="mt-5 grid gap-5">
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
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                runSearch(nextQuery, { defer: true });
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearch();
                }
              }}
              className="h-10 rounded-[10px] border border-fb-line bg-white px-3 text-[13px] font-medium text-fb-ink outline-none focus:border-fb-trust"
              placeholder="삼성전자, 에코프로, 005930..."
            />
            <Button type="button" variant="secondary" size="sm" onClick={handleSearch}>
              검색
            </Button>
          </div>

          <div className="mt-3 grid gap-2 rounded-[12px] border border-fb-line bg-fb-card-alt p-3 sm:grid-cols-[minmax(0,1fr)_120px]">
            <label
              className="grid min-w-0 gap-1 text-[12px] font-bold text-fb-ink-2"
              htmlFor="holding-account-category"
            >
              계좌 유형
              <select
                id="holding-account-category"
                value={addAccountCategory}
                onChange={(event) => setAddAccountCategory(event.target.value as AccountCategory)}
                className="h-10 w-full min-w-0 rounded-[10px] border border-fb-line bg-white px-3 text-[13px] font-semibold text-fb-ink outline-none focus:border-fb-trust"
              >
                {accountCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid min-w-0 gap-1 text-[12px] font-bold text-fb-ink-2" htmlFor="holding-add-quantity">
              추가 수량
              <input
                id="holding-add-quantity"
                value={addQuantity}
                onChange={(event) => setAddQuantity(event.target.value)}
                className="h-10 w-full min-w-0 rounded-[10px] border border-fb-line bg-white px-3 text-[13px] font-semibold text-fb-ink outline-none focus:border-fb-trust"
                inputMode="decimal"
              />
            </label>
          </div>

          {submittedQuery ? (
            <div
              data-testid="instrument-autocomplete-slot"
              className="mt-2 grid gap-1.5 rounded-[12px] border border-fb-line bg-white p-2"
            >
              {searchError ? (
                <p className="rounded-[10px] bg-fb-card-alt px-3 py-2 text-[13px] font-medium text-fb-ink-3">
                  {searchError}
                </p>
              ) : searchResults.length === 0 ? (
                <p className="rounded-[10px] bg-fb-card-alt px-3 py-2 text-[13px] font-medium text-fb-ink-3">
                  검색 결과가 없어요.
                </p>
              ) : (
                visibleSearchResults.map((result) => (
                  <div
                    key={result.id}
                    className="grid min-h-11 gap-2 rounded-[10px] bg-fb-card-alt px-3 py-2 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-fb-ink">{result.displayName}</p>
                      <p className="mt-0.5 text-[12px] text-fb-ink-3">
                        {result.symbol}
                        {result.lastClosePrice
                          ? ` · ${result.lastCloseDate ? `${result.lastCloseDate} 종가` : "마지막 거래일 종가"} ${formatKrw(result.lastClosePrice)}`
                          : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => addHolding(result)}
                    >
                      추가
                    </Button>
                  </div>
                ))
              )}
              {!searchError && searchResults.length > SEARCH_RESULTS_PAGE_SIZE ? (
                <div className="flex h-8 items-center justify-between gap-2 px-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={searchPage === 0}
                    onClick={() => setSearchPage((page) => Math.max(0, page - 1))}
                  >
                    이전 검색 결과
                  </Button>
                  <span className="fb-num text-[12px] font-bold text-fb-ink-3">
                    {searchPage + 1} / {totalSearchPages}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={searchPage >= totalSearchPages - 1}
                    onClick={() => setSearchPage((page) => Math.min(totalSearchPages - 1, page + 1))}
                  >
                    다음 검색 결과
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}

          <div data-testid="holdings-section" className="mt-5 border-t border-fb-line pt-4">
            {items.length === 0 ? (
              <p className="rounded-[12px] bg-fb-card-alt px-3 py-3 text-[13px] font-medium text-fb-ink-3">
                아직 등록한 종목이 없어요.
              </p>
            ) : (
              <div className="grid gap-4">
                {groupedHoldings
                  .filter((section) => section.holdings.length > 0)
                  .map((section) => (
                    <section key={section.value} data-testid={`holdings-section-${section.value}`} className="grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[12px] font-bold text-fb-ink-2">{section.title}</h3>
                      </div>
                      <div className="grid gap-3">
                        {section.holdings.map((holding) => {
                          const accountCategory = holding.accountCategory ?? "general";
                          const unitPrice = getUnitPrice(holding);

                          return (
                            <div
                              key={holding.id}
                              className="grid gap-3 rounded-[12px] border border-fb-line bg-white p-3"
                            >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[14px] font-bold text-fb-ink">{holding.displayName}</p>
                                <span className="rounded-full bg-fb-trust-soft px-2 py-0.5 text-[11px] font-bold text-fb-trust-ink">
                                  {accountCategoryLabels[accountCategory]}
                                </span>
                                <span className="rounded-full bg-fb-card-alt px-2 py-0.5 text-[11px] font-bold text-fb-ink-3">
                                  {getDiagnosisCategoryLabel(accountCategory)}
                                </span>
                                <span className="fb-num rounded-full bg-fb-card-alt px-2 py-0.5 text-[11px] font-bold text-fb-ink-3">
                                  {holding.symbol}
                                </span>
                              </div>
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
                                <div className="mt-3 grid grid-cols-1 gap-2 rounded-[12px] bg-fb-card-alt p-3 sm:grid-cols-3">
                                  <p className="fb-num text-[13px] font-bold text-fb-ink">
                                    보유 {formatPlainNumber(holding.quantity)}주
                                  </p>
                                  <p className="fb-num text-[13px] font-bold text-fb-ink">
                                    기준가 {formatKrw(unitPrice)}
                                  </p>
                                  <p className="fb-num text-[13px] font-bold text-fb-ink">
                                    평가액 {formatKrw(holding.valuationAmount)}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
                              <p className="text-[12px] font-medium text-fb-ink-3">
                                {getDiagnosisCategoryLabel(accountCategory)} 기준
                              </p>
                              <div className="grid grid-cols-2 gap-1.5 sm:flex">
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
                          );
                        })}
                      </div>
                    </section>
                  ))}
              </div>
            )}
          </div>
        </section>

        <details className="rounded-[16px] border border-fb-line bg-fb-card-alt p-4">
          <summary className="cursor-pointer text-[13px] font-bold text-fb-ink">
            해외거래소 직접 보유
          </summary>
          <p className="mt-2 text-[12px] leading-5 text-fb-ink-3">
            VOO, SPY, QQQ처럼 미국 거래소에 직접 상장된 자산만 수동으로 계산해요. TIGER·ACE 같은 국내상장 ETF는 위 종목 검색으로 추가해요.
          </p>

          <div className="mt-4 grid gap-3 rounded-[12px] border border-fb-line bg-white p-3">
            <div className="grid gap-2 lg:grid-cols-4">
              <label className="grid gap-1 text-[12px] font-bold text-fb-ink-2" htmlFor="overseas-name">
                티커/이름
                <input
                  id="overseas-name"
                  value={overseasName}
                  onChange={(event) => setOverseasName(event.target.value)}
                  className="h-10 rounded-[10px] border border-fb-line bg-white px-3 text-[13px] font-semibold text-fb-ink outline-none focus:border-fb-trust"
                  placeholder="VOO"
                />
              </label>
              <label className="grid gap-1 text-[12px] font-bold text-fb-ink-2" htmlFor="overseas-quantity">
                보유 수량
                <input
                  id="overseas-quantity"
                  value={overseasQuantity}
                  onChange={(event) => setOverseasQuantity(event.target.value)}
                  className="h-10 rounded-[10px] border border-fb-line bg-white px-3 text-[13px] font-semibold text-fb-ink outline-none focus:border-fb-trust"
                  inputMode="decimal"
                />
              </label>
              <label className="grid gap-1 text-[12px] font-bold text-fb-ink-2" htmlFor="overseas-usd-price">
                1주 가격 USD
                <input
                  id="overseas-usd-price"
                  value={overseasUsdPrice}
                  onChange={(event) => setOverseasUsdPrice(event.target.value)}
                  className="h-10 rounded-[10px] border border-fb-line bg-white px-3 text-[13px] font-semibold text-fb-ink outline-none focus:border-fb-trust"
                  inputMode="decimal"
                />
              </label>
              <label className="grid gap-1 text-[12px] font-bold text-fb-ink-2" htmlFor="overseas-exchange-rate">
                적용 환율
                <input
                  id="overseas-exchange-rate"
                  value={overseasExchangeRate}
                  onChange={(event) => setOverseasExchangeRate(event.target.value)}
                  className="h-10 rounded-[10px] border border-fb-line bg-white px-3 text-[13px] font-semibold text-fb-ink outline-none focus:border-fb-trust"
                  inputMode="decimal"
                />
              </label>
            </div>

            <div className="grid gap-2 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-[12px] font-bold text-fb-ink-2">계산된 원화 평가액</p>
                <p className="fb-num mt-1 text-[18px] font-bold text-fb-ink">
                  {formatKrw(overseasManualValuation)}
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={addOverseasManualHolding}>
                계산 결과 추가
              </Button>
            </div>

            {overseasHoldings.length > 0 ? (
              <div className="grid gap-2 border-t border-fb-line pt-3">
                {overseasHoldings.map((holding) => (
                  <div
                    key={holding.id}
                    className="grid gap-1 rounded-[10px] bg-fb-card-alt px-3 py-2 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <p className="text-[13px] font-bold text-fb-ink">{holding.name}</p>
                      <p className="text-[12px] font-medium text-fb-ink-3">
                        {formatPlainNumber(holding.quantity)}주 · ${formatPlainNumber(holding.usdPrice)} · ₩
                        {formatPlainNumber(holding.exchangeRate)}
                      </p>
                    </div>
                    <p className="fb-num text-[14px] font-bold text-fb-ink">
                      {formatKrw(holding.valuationAmount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <p className="mt-4 rounded-[12px] bg-white px-3 py-3 text-[12px] leading-5 text-fb-ink-3">
            연금저축/IRP는 표시 순자산에는 포함하고 기본 FIRE 계산에서는 제외해요.
          </p>
        </details>
      </div>
    </Card>
  );
}

function calculateOverseasManualValuation(quantityInput: string, usdPriceInput: string, exchangeRateInput: string) {
  const quantity = parsePositiveNumber(quantityInput);
  const usdPrice = parsePositiveNumber(usdPriceInput);
  const exchangeRate = parsePositiveNumber(exchangeRateInput);

  if (!quantity || !usdPrice || !exchangeRate) {
    return 0;
  }

  return Math.round(quantity * usdPrice * exchangeRate);
}

function parsePositiveNumber(value: string) {
  const parsed = Number(value.replaceAll(",", ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatPlainNumber(value: number) {
  return value.toLocaleString("ko-KR", { maximumFractionDigits: 4 });
}

function persistDemoHoldings(holdings: HoldingView[]) {
  const value = encodeURIComponent(JSON.stringify(holdings));
  document.cookie = `${DEMO_HOLDINGS_COOKIE}=${value}; Path=/; Max-Age=2592000; SameSite=Lax`;
}
