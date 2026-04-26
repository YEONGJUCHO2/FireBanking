import { AppHeader, Button, Icon, MobileAppShell, MoneyInputRow, ProgressStepper } from '@/components/fire-banking'
import { liteRows } from '@/lib/sample-data'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  return (
    <MobileAppShell>
      <AppHeader title="초대 수락" subtitle="간단한 3가지 입력으로 이번 달 체크인에 참여해요." backHref="/dashboard" />

      <div className="space-y-5 px-5 pb-6">
        <section className="fb-card p-6 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-fb-sand text-fb-green" aria-hidden="true"><Icon name="mail" className="size-9" /></div>
          <p className="mt-5 text-sm font-bold text-fb-green">Fire Banking에 초대받았어요</p>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-fb-ink">배우자 워크스페이스에 참여해요</h1>
          <p className="mt-3 text-sm leading-6 text-fb-muted">함께 보기 위한 최소 정보만 입력합니다. 서로를 평가하기 위한 화면이 아니에요.</p>
          <div className="mt-5 rounded-soft bg-fb-green-50 p-4 text-left text-sm leading-6 text-fb-muted">
            <div className="flex justify-between gap-4"><span>초대 보낸 사람</span><strong className="text-fb-ink">배우자</strong></div>
            <div className="mt-2 flex justify-between gap-4"><span>초대 토큰</span><strong className="text-fb-ink">{token.slice(0, 8)}</strong></div>
          </div>
        </section>

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
