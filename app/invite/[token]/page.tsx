import { AppHeader, Button, MobileAppShell, MoneyInputRow, ProgressStepper } from '@/components/fire-banking'
import { liteRows } from '@/lib/sample-data'
import Image from 'next/image'

export default async function InvitePage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams?: Promise<{ lite?: string }> }) {
  const { token } = await params
  const query = await searchParams

  if (query?.lite === '1') {
    return <LiteInputScreen token={token} />
  }

  return (
    <MobileAppShell>
      <AppHeader title="초대 수락" backHref="/dashboard" />

      <div className="flex min-h-[690px] flex-col px-5 pb-6">
        <section className="pt-10 text-center">
          <Image src="/fire-banking/invite-envelope.png" alt="" width={136} height={136} className="mx-auto size-32 object-contain mix-blend-multiply" />
          <h1 className="mt-8 text-2xl font-bold tracking-normal text-fb-ink">Fire Banking에 초대받았어요!</h1>
          <p className="mt-3 text-sm leading-6 text-fb-muted">함께 가정의 경제적 자유를 설계해 보아요.</p>

          <div className="mt-12 rounded-card border border-fb-line bg-fb-bg p-5 text-left text-sm leading-6 text-fb-muted">
            <div className="flex justify-between gap-4"><span>초대 보낸 사람</span><strong className="text-fb-ink">배우자</strong></div>
            <div className="mt-2 flex justify-between gap-4"><span>초대 토큰</span><strong className="text-fb-ink">{token.slice(0, 8)}</strong></div>
          </div>
        </section>

        <div className="mt-auto grid gap-3 pt-8">
          <Button href={`/invite/${token}?lite=1`} size="lg">수락하고 시작하기</Button>
          <Button href="/dashboard" variant="secondary" size="lg">나중에 하기</Button>
        </div>
      </div>
    </MobileAppShell>
  )
}

function LiteInputScreen({ token }: { token: string }) {
  return (
    <MobileAppShell>
      <AppHeader title="나의 기본 정보 (Lite)" subtitle="정확하지 않아도 괜찮아요. 지금은 첫 거리감을 보는 단계예요." backHref={`/invite/${token}`} />

      <div className="space-y-5 px-5 pb-6">
        <section className="fb-card p-5">
          <p className="text-sm font-bold text-fb-green">Lite 입력</p>
          <h2 className="mt-1 text-xl font-bold tracking-normal text-fb-ink">정확하지 않아도 괜찮아요.</h2>
          <p className="mt-2 text-sm leading-6 text-fb-muted">지금은 첫 거리감을 보는 단계예요. 단위는 만원입니다.</p>

          <div className="mt-5 space-y-4">
            {liteRows.map((row) => <MoneyInputRow key={row.label} label={row.label} value={row.value} soft />)}
          </div>

          <div className="mt-5 rounded-soft bg-fb-green-50 p-4 text-sm leading-6 text-fb-muted">지난달과 같다면 빠르게 진행할 수 있어요.</div>
          <div className="mt-4 grid gap-2">
            <Button variant="soft">지난달과 같아요</Button>
            <Button href="/dashboard">수락하고 결과 보기</Button>
            <Button href="/" variant="secondary">나중에 하기</Button>
          </div>
        </section>

        <ProgressStepper steps={['입력', '확인', '완료']} current={0} />
      </div>
    </MobileAppShell>
  )
}
