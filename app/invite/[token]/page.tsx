import { BrandLockup, Button, Card, MobileAppShell } from '@/components/fire-banking'
import { Icon } from '@/components/fire-banking/icons'
import { LiteOnboarding } from '@/components/fire-banking/lite-onboarding'

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams?: Promise<{ lite?: string }>
}) {
  const { token } = await params
  const query = await searchParams

  if (query?.lite === '1') {
    return (
      <MobileAppShell>
        <LiteOnboarding token={token} doneHref="/dashboard" />
      </MobileAppShell>
    )
  }

  return (
    <MobileAppShell>
      <section className="flex flex-1 flex-col px-6 pb-8 pt-14">
        <BrandLockup compact />

        <div className="mt-14">
          {/* couple symbol */}
          <div className="relative mb-6 h-14 w-24">
            <div className="absolute left-0 top-0 flex size-14 items-center justify-center rounded-full border-[3px] border-fb-page bg-fb-ink text-[22px] font-bold tracking-[-0.020em] text-white">
              지
            </div>
            <div className="absolute left-10 top-0 flex size-14 items-center justify-center rounded-full border-[3px] border-fb-page bg-fb-trust-soft text-[22px] font-bold tracking-[-0.020em] text-fb-trust-ink">
              민
            </div>
          </div>

          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.10em] text-fb-trust">
            지윤님이 보낸 초대
          </p>
          <h1 className="text-[28px] font-bold leading-[1.28] tracking-[-0.024em] text-fb-ink">
            부부 워크스페이스에<br />
            함께 들어와 주세요.
          </h1>
          <p className="mt-4 text-[15px] font-medium leading-[1.55] text-fb-ink-2">
            매일 쓰는 가계부가 아니에요.<br />
            월 1회, 큰 숫자 몇 개만 같이 보면 돼요.
          </p>
        </div>

        <Card tone="alt" className="mt-7 p-4">
          <div className="flex flex-col gap-3">
            <ReassureRow text="지윤님의 입력 내역은 보이지 않아요." />
            <ReassureRow text="민호님 숫자도 합산 결과로만 표시돼요." />
            <ReassureRow text="언제든 워크스페이스에서 나갈 수 있어요." />
          </div>
        </Card>

        <div className="flex-1" />

        <div className="flex flex-col gap-2.5">
          <Button variant="inverse" size="lg" full href={`/invite/${token}?lite=1`}>
            워크스페이스 참여하기
          </Button>
          <Button variant="ghost" size="md" full href="/">
            나중에 할게요
          </Button>
        </div>
      </section>
    </MobileAppShell>
  )
}

function ReassureRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-fb-line bg-white">
        <Icon name="check" className="size-3 text-fb-ink" />
      </span>
      <span className="text-[14px] font-medium leading-[1.5] tracking-[-0.004em] text-fb-ink">{text}</span>
    </div>
  )
}
