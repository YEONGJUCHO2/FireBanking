import { AssetsScreenPreview, BrandLockup, DashboardScreenPreview, DesktopDashboard, InviteScreenPreview, LiteScreenPreview, LoginScreenPreview, OnboardingScreenPreview, PageCanvas, PhoneMockup, SimulatorScreenPreview } from '@/components/fire-banking'

export default function ShowcasePage() {
  return (
    <div data-screen-label="showcase">
      <PageCanvas className="max-w-[1680px] mx-auto">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div><BrandLockup tagline={false} /><p className="mt-2 text-sm text-fb-ink-2">디자인 이미지 기반 프론트 구현 쇼케이스</p></div>
          <p className="text-sm font-bold text-fb-trust">Mobile-first · Couple check-in · Monthly ritual</p>
        </header>

        <div className="fb-scrollbar-none flex gap-6 overflow-x-auto pb-6">
          <div data-od-id="phone-mockup-login"><PhoneMockup label="1 로그인 / 진입" subtitle="함께하는 여정의 시작"><LoginScreenPreview /></PhoneMockup></div>
          <div data-od-id="phone-mockup-onboarding"><PhoneMockup label="2 R0 온보딩" subtitle="우리 가정의 현재 상태"><OnboardingScreenPreview /></PhoneMockup></div>
          <div data-od-id="phone-mockup-dashboard"><PhoneMockup label="3 결과 대시보드" subtitle="경제적 자유 현황"><DashboardScreenPreview /></PhoneMockup></div>
          <div data-od-id="phone-mockup-invite"><PhoneMockup label="4 배우자 초대" subtitle="함께 보면 더 정확하게"><InviteScreenPreview /></PhoneMockup></div>
          <div data-od-id="phone-mockup-lite"><PhoneMockup label="5 초대 수락 / 배우자 입력" subtitle="3가지 입력으로 참여"><LiteScreenPreview /></PhoneMockup></div>
          <div data-od-id="phone-mockup-simulator"><PhoneMockup label="6 FIRE 생활비 조정기" subtitle="목표 생활비 조정"><SimulatorScreenPreview /></PhoneMockup></div>
          <div data-od-id="phone-mockup-assets"><PhoneMockup label="자산 진단" subtitle="FIRE 계산 순자산 구성"><AssetsScreenPreview /></PhoneMockup></div>
        </div>

        <section className="mt-4" data-od-id="desktop-dashboard">
          <div className="mb-4 flex items-center gap-2"><span className="flex size-6 items-center justify-center rounded-full bg-fb-trust text-xs font-bold text-white">7</span><div><h2 className="text-lg font-bold tracking-normal">데스크톱 대응안</h2><p className="text-sm text-fb-ink-2">PC에서도 한눈에 확인하고 관리할 수 있어요.</p></div></div>
          <DesktopDashboard />
        </section>
      </PageCanvas>
    </div>
  )
}
