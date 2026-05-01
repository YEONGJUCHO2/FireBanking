import { DesktopDashboard } from '@/components/fire-banking'
import { SignOutButton } from '@/src/features/auth/components/SignOutButton'
import { InvestmentAssetPanel } from '@/src/features/assets/components/InvestmentAssetPanel'
import { LiabilityPanel } from '@/src/features/assets/components/LiabilityPanel'
import { DashboardMobile } from './dashboard-mobile'

export default function DashboardPage() {
  return (
    <>
      <div className="grid gap-4 bg-fb-page px-4 py-4 lg:hidden">
        <DashboardMobile />
        <InvestmentAssetPanel />
        <LiabilityPanel />
      </div>

      <div className="hidden min-h-dvh bg-fb-page px-8 py-10 lg:block">
        <DesktopDashboard footerAction={<SignOutButton />} />
        <section className="mx-auto mt-6 grid w-full max-w-[1280px] gap-5">
          <InvestmentAssetPanel />
          <LiabilityPanel />
        </section>
      </div>
    </>
  )
}
