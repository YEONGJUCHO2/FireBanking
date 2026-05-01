import { DesktopDashboard } from '@/components/fire-banking'
import { SignOutButton } from '@/src/features/auth/components/SignOutButton'
import { DashboardMobile } from './dashboard-mobile'

export default function DashboardPage() {
  return (
    <>
      <div className="lg:hidden">
        <DashboardMobile />
      </div>

      <div className="hidden min-h-dvh bg-fb-page px-8 py-10 lg:block">
        <DesktopDashboard footerAction={<SignOutButton />} />
      </div>
    </>
  )
}
