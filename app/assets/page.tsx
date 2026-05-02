import { AppHeader, BottomNav, MobileAppShell, PageCanvas } from "@/components/fire-banking";
import { InvestmentAssetPanel } from "@/src/features/assets/components/InvestmentAssetPanel";
import { LiabilityPanel } from "@/src/features/assets/components/LiabilityPanel";

export default function AssetsPage() {
  return (
    <>
      <div className="lg:hidden">
        <MobileAppShell>
          <AppHeader
            title="자산·부채 관리"
            subtitle="FIRE 예상일 계산에 들어갈 자동평가 자산과 빚 정보를 정리해요."
            backHref="/dashboard"
          />
          <main className="flex-1 overflow-auto px-4 pb-28 pt-2">
            <div className="grid gap-4">
              <InvestmentAssetPanel />
              <LiabilityPanel />
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
                자산·부채 관리
              </h1>
              <p className="mt-2 text-[14px] font-medium text-fb-ink-3">
                대시보드는 요약만 보고, 세부 입력은 이 화면에서 다뤄요.
              </p>
            </div>
          </header>

          <section className="grid gap-5">
            <InvestmentAssetPanel />
            <LiabilityPanel />
          </section>
        </div>
      </PageCanvas>
    </>
  );
}
