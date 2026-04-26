import { BrandLockup, Button, MobileAppShell } from '@/components/fire-banking'
import { Icon } from '@/components/fire-banking/icons'

export default function HomePage() {
  return (
    <MobileAppShell>
      <div className="flex min-h-[calc(100dvh-2.5rem)] flex-col px-5 py-6">
        <BrandLockup />

        <section className="mt-12">
          <p className="text-sm font-bold text-fb-green">월 1회, 3분 체크인</p>
          <h1 className="mt-3 text-[2rem] font-bold leading-tight tracking-normal text-fb-ink">
            부부가 함께
            <br />
            순자산과 경제적 자유
            <br />
            진척을 확인해요.
          </h1>
          <p className="mt-4 text-base leading-7 text-fb-muted">상세 가계부가 아니라, 두 사람이 같은 숫자를 보고 돈 이야기를 덜 불편하게 시작하는 앱입니다.</p>
        </section>

        <div className="mt-auto pt-10">
          <div className="relative h-64 overflow-hidden rounded-[1.75rem] border border-fb-line bg-[linear-gradient(180deg,#f2e9dc_0%,#f2f8f5_100%)] shadow-card">
            <div className="absolute left-1/2 top-16 size-12 -translate-x-1/2 rounded-full bg-white shadow-[0_0_48px_rgba(255,255,255,0.9)]" />
            <div className="absolute bottom-0 left-[-18%] h-32 w-[72%] rounded-[100%_100%_0_0] bg-fb-green/45" />
            <div className="absolute bottom-0 right-[-18%] h-40 w-[78%] rounded-[100%_100%_0_0] bg-fb-green-900/42" />
            <div className="absolute bottom-[-26px] left-[18%] h-24 w-[64%] -rotate-6 rounded-[100%] border-t border-white/60 bg-white/20" />
          </div>

          <div className="mt-5 grid gap-3">
            <Button href="/onboarding" size="lg">시작하기</Button>
            <Button href="/dashboard" variant="secondary" size="lg">로그인</Button>
          </div>

          <div className="mt-5 flex gap-3 rounded-card border border-fb-line bg-white/70 p-4 text-sm leading-6 text-fb-muted">
            <Icon name="shield" className="mt-0.5 size-5 shrink-0 text-fb-green" />
            <p><span className="font-bold text-fb-green">안전하게 보호돼요.</span> 입력 데이터는 결과 계산과 월간 체크인에만 사용되는 것을 전제로 설계했습니다.</p>
          </div>
        </div>
      </div>
    </MobileAppShell>
  )
}
