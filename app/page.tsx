import { BrandLockup, Button, MobileAppShell } from '@/components/fire-banking'
import { Icon } from '@/components/fire-banking/icons'
import Image from 'next/image'

export default function HomePage() {
  return (
    <MobileAppShell>
      <div className="flex min-h-[720px] flex-col px-5 pb-6 pt-4">
        <BrandLockup />

        <section className="mt-10">
          <h1 className="text-[2rem] font-bold leading-tight tracking-normal text-fb-ink">
            부부가 함께
            <br />
            순자산과 경제적 자유
            <br />
            진척을 확인해요.
          </h1>
        </section>

        <div className="mt-auto pt-10">
          <div className="relative h-60 overflow-hidden rounded-[1.75rem] border border-fb-line bg-fb-sand shadow-card">
            <Image
              src="/fire-banking/login-mountain.png"
              alt=""
              fill
              priority
              sizes="(max-width: 430px) 100vw, 430px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,248,244,0.1)_0%,rgba(30,91,74,0.04)_48%,rgba(18,61,51,0.12)_100%)]" />
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
