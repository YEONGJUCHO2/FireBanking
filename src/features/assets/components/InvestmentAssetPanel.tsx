import { Button, Card, SectionHeader, StatusPill } from "@/components/fire-banking";
import { formatKrw } from "@/src/lib/format";

type HoldingView = {
  id: string;
  symbol: string;
  displayName: string;
  quantity: number;
  valuationAmount: number;
  valuationDate: string;
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

export function InvestmentAssetPanel({ holdings = defaultHoldings }: { holdings?: HoldingView[] }) {
  const total = holdings.reduce((sum, holding) => sum + holding.valuationAmount, 0);

  return (
    <Card className="p-5 md:p-6">
      <SectionHeader
        title="투자자산"
        subtitle="국내주식과 국내 ETF를 종목별로 자동 계산해요."
        action={<StatusPill label="국내 상장 우선" status="info" />}
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
            <Button type="button" variant="secondary" size="sm">
              검색 준비중
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {recommendations.map((item) => (
              <span
                key={item}
                className="rounded-full border border-fb-line bg-fb-card-alt px-3 py-1.5 text-[12px] font-semibold text-fb-ink-2"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-5 border-t border-fb-line pt-4">
            {holdings.length === 0 ? (
              <p className="rounded-[12px] bg-fb-card-alt px-3 py-3 text-[13px] font-medium text-fb-ink-3">
                아직 등록한 종목이 없어요.
              </p>
            ) : (
              <div className="grid gap-3">
                {holdings.map((holding) => (
                  <div
                    key={holding.id}
                    className="grid gap-3 rounded-[12px] border border-fb-line bg-white p-3 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <p className="text-[14px] font-bold text-fb-ink">{holding.displayName}</p>
                      <p className="mt-1 text-[12px] text-fb-ink-3">
                        {holding.symbol} · {holding.quantity.toLocaleString("ko-KR")}주 · 마지막 거래일{" "}
                        {holding.valuationDate} 기준
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <p className="fb-num text-[15px] font-bold text-fb-ink">
                        {formatKrw(holding.valuationAmount)}
                      </p>
                      <div className="flex gap-1.5">
                        <Button type="button" variant="ghost" size="sm">
                          수량 수정
                        </Button>
                        <Button type="button" variant="dangerSoft" size="sm">
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
