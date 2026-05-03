import { AppHeader, BottomNav, MobileAppShell, PageCanvas } from "@/components/fire-banking";
import { InvestmentAssetPanel } from "@/src/features/assets/components/InvestmentAssetPanel";
import { LiabilityPanel } from "@/src/features/assets/components/LiabilityPanel";
import { getAssetManagementData } from "@/src/features/assets/lib/getAssetManagementData";

export default async function AssetsPage() {
  const assetData = await getAssetManagementData();

  return (
    <>
      <div className="lg:hidden">
        <MobileAppShell>
          <AppHeader
            title="FIRE 자산 진단"
            subtitle="FIRE까지 남은 금액에 들어갈 투자자산 KPI를 검증해요."
            backHref="/dashboard"
          />
          <main className="flex-1 overflow-auto px-4 pb-28 pt-2">
            <div className="grid gap-4">
              <InvestmentAssetPanel coupleId={assetData.coupleId} holdings={assetData.holdings} />
              <LiabilityPanel coupleId={assetData.coupleId} liabilities={assetData.liabilities} />
            </div>
          </main>
          <BottomNav active="home" partnerPending />
        </MobileAppShell>
      </div>

      <PageCanvas className="hidden lg:block">
        <div className="mx-auto grid w-full max-w-[1280px] gap-6">
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

          <section className="grid gap-5">
            <InvestmentAssetPanel coupleId={assetData.coupleId} holdings={assetData.holdings} />
            <LiabilityPanel coupleId={assetData.coupleId} liabilities={assetData.liabilities} />
          </section>
        </div>
      </PageCanvas>
    </>
  );
}
