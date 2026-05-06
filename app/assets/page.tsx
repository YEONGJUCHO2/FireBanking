import { AppHeader, BottomNav, MobileAppShell, PageCanvas } from "@/components/fire-banking";
import { InvestmentAssetPanel } from "@/src/features/assets/components/InvestmentAssetPanel";
import { LiabilityPanel } from "@/src/features/assets/components/LiabilityPanel";
import { getAssetManagementData } from "@/src/features/assets/lib/getAssetManagementData";

export default async function AssetsPage() {
  const assetData = await getAssetManagementData();

  return (
    <div data-screen-label="assets">
      {/* ── Mobile ── */}
      <div className="lg:hidden">
        <MobileAppShell>
          <AppHeader
            title="FIRE 자산 진단"
            subtitle="FIRE까지 남은 금액에 들어갈 투자자산 KPI를 검증해요."
            backHref="/dashboard"
          />
          <main className="flex-1 overflow-auto px-4 pb-28 pt-2">
            {/* Hero — FIRE 계산 순자산 공식 */}
            <div
              data-od-id="hero-net-worth-formula"
              className="mb-4 rounded-[24px] border border-fb-line bg-fb-card p-5 shadow-elevated"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
                FIRE 반영 순자산 공식
              </p>
              <p className="mt-2 text-[15px] font-bold leading-snug tracking-[-0.012em] text-fb-ink">
                즉시 운용 가능 투자자산
                <br />
                <span className="text-fb-ink-3">−</span> 투자 연계 부채
              </p>
              <p className="mt-3 text-[12px] font-medium leading-[1.6] text-fb-ink-2">
                일반·기타 계좌 국내주식·ETF와 해외거래소 직접 보유는 FIRE 반영,
                연금저축·IRP는 제한·미래 자산으로 제외해요.
              </p>
            </div>

            <div className="grid gap-4">
              {/* FIRE 반영 투자자산 그룹 */}
              <div data-od-id="group-fire-investments">
                <InvestmentAssetPanel
                  coupleId={assetData.coupleId}
                  holdings={assetData.holdings}
                />
              </div>

              {/* 투자 연계 부채 그룹 */}
              <div data-od-id="group-loans">
                <LiabilityPanel
                  coupleId={assetData.coupleId}
                  liabilities={assetData.liabilities}
                />
              </div>
            </div>

            {/* CTA 영역 */}
            <div className="mt-4 grid gap-3">
              <button
                data-od-id="cta-add-asset"
                className="h-11 rounded-button border border-fb-line bg-fb-card text-[13px] font-bold text-fb-ink shadow-soft hover:bg-fb-card-alt"
              >
                + 투자자산 추가
              </button>
              <button
                data-od-id="cta-add-liability"
                className="h-11 rounded-button border border-fb-line bg-fb-card text-[13px] font-bold text-fb-ink-2 shadow-soft hover:bg-fb-card-alt"
              >
                + 투자 연계 부채 추가
              </button>
            </div>
          </main>

          <div data-od-id="bottom-nav">
            <BottomNav active="home" partnerPending />
          </div>
        </MobileAppShell>
      </div>

      {/* ── Desktop ── */}
      <PageCanvas className="hidden lg:block">
        <div className="mx-auto grid w-full max-w-[1280px] gap-6">
          {/* 페이지 헤더 */}
          <header className="flex items-end justify-between border-b border-fb-line pb-5">
            <div>
              <a
                href="/dashboard"
                className="fbpress mb-4 inline-flex h-9 items-center rounded-full border border-fb-line bg-white px-3 text-[13px] font-semibold text-fb-ink-2 hover:bg-fb-card-alt"
              >
                홈으로
              </a>
              <h1 className="text-[30px] font-bold tracking-[-0.024em] text-fb-ink">
                FIRE 자산 진단
              </h1>
              <p className="mt-2 text-[14px] font-medium text-fb-ink-3">
                바로 쓸 수 있는 투자자산과 투자 연동 대출을 분리해서 FIRE 반영 금액을 확인해요.
              </p>
            </div>
          </header>

          {/* Hero — FIRE 계산 순자산 공식 */}
          <div
            data-od-id="hero-net-worth-formula"
            className="rounded-[24px] border border-fb-line bg-fb-card p-6 shadow-elevated"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.10em] text-fb-ink-3">
              FIRE 반영 순자산 공식
            </p>
            <p className="mt-2 text-[20px] font-bold tracking-[-0.018em] text-fb-ink">
              FIRE 계산 순자산 = 즉시 운용 가능 투자자산 − 투자 연계 부채
            </p>
            <p className="mt-3 text-[13px] font-medium leading-[1.6] text-fb-ink-2">
              일반·기타 계좌 국내주식·ETF와 해외거래소 직접 보유는 FIRE 반영, 연금저축·IRP는
              제한·미래 자산으로 제외해요. 주거·생활 부채는 KPI에서 제외하고, 투자 자산 취득을
              위해 빌린 대출(우리사주·주식담보대출 등)만 차감해요.
            </p>
          </div>

          <section className="grid gap-5">
            {/* FIRE 반영 투자자산 그룹 */}
            <div data-od-id="group-fire-investments">
              <InvestmentAssetPanel
                coupleId={assetData.coupleId}
                holdings={assetData.holdings}
              />
            </div>

            {/* 투자 연계 부채 그룹 */}
            <div data-od-id="group-loans">
              <LiabilityPanel
                coupleId={assetData.coupleId}
                liabilities={assetData.liabilities}
              />
            </div>
          </section>

          {/* CTA 영역 */}
          <div className="flex items-center gap-3">
            <button
              data-od-id="cta-add-asset"
              className="h-10 rounded-button border border-fb-line bg-white px-4 text-[13px] font-bold text-fb-ink shadow-soft hover:bg-fb-card-alt"
            >
              + 투자자산 추가
            </button>
            <button
              data-od-id="cta-add-liability"
              className="h-10 rounded-button border border-fb-line bg-white px-4 text-[13px] font-bold text-fb-ink-2 shadow-soft hover:bg-fb-card-alt"
            >
              + 투자 연계 부채 추가
            </button>
          </div>
        </div>
      </PageCanvas>
    </div>
  );
}
