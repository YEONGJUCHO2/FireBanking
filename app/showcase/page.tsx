import { BrandLockup, DashboardScreenPreview, DesktopDashboard, InviteScreenPreview, LiteScreenPreview, LoginScreenPreview, OnboardingScreenPreview, PageCanvas, PhoneMockup, SimulatorScreenPreview } from '@/components/fire-banking'

export default function ShowcasePage() {
  return (
    <PageCanvas className="max-w-[1680px] mx-auto">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><BrandLockup tagline={false} /><p className="mt-2 text-sm text-fb-muted">디자인 이미지 기반 프론트 구현 쇼케이스</p></div>
        <p className="text-sm font-bold text-fb-green">Mobile-first · Admin/Lite · Monthly ritual</p>
      </header>

      <div className="fb-scrollbar-none flex gap-6 overflow-x-auto pb-6">
        <PhoneMockup label="1 로그인 / 진입" subtitle="함께하는 여정의 시작"><LoginScreenPreview /></PhoneMockup>
        <PhoneMockup label="2 R0 온보딩" subtitle="우리 가정의 현재 상태"><OnboardingScreenPreview /></PhoneMockup>
        <PhoneMockup label="3 결과 대시보드" subtitle="경제적 자유 현황"><DashboardScreenPreview /></PhoneMockup>
        <PhoneMockup label="4 배우자 초대" subtitle="함께 보면 더 정확하게"><InviteScreenPreview /></PhoneMockup>
        <PhoneMockup label="5 초대 수락 / Lite" subtitle="3가지 입력으로 참여"><LiteScreenPreview /></PhoneMockup>
        <PhoneMockup label="6 고정비 시뮬레이터" subtitle="반복 지출의 미래 영향"><SimulatorScreenPreview /></PhoneMockup>
      </div>

      <section className="mt-4">
        <div className="mb-4 flex items-center gap-2"><span className="flex size-6 items-center justify-center rounded-full bg-fb-green text-xs font-bold text-white">7</span><div><h2 className="text-lg font-bold tracking-normal">데스크톱 대응안</h2><p className="text-sm text-fb-muted">PC에서도 한눈에 확인하고 관리할 수 있어요.</p></div></div>
        <DesktopDashboard />
      </section>
    </PageCanvas>
  )
}
