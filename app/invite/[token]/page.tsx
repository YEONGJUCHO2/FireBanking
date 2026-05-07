import { BrandLockup, Button, Card, MobileAppShell } from '@/components/fire-banking'
import { Icon } from '@/components/fire-banking/icons'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  return (
    <MobileAppShell>
      <section
        data-screen-label="invite-accept"
        className="flex flex-1 flex-col px-6 pb-8 pt-14"
      >
        <BrandLockup compact />

        <div data-od-id="invite-card" className="mt-14">
          {/* couple symbol */}
          <div className="relative mb-6 h-14 w-24">
            <div className="absolute left-0 top-0 flex size-14 items-center justify-center rounded-full border-[3px] border-fb-page bg-fb-ink text-[22px] font-bold tracking-[-0.020em] text-white">
              나
            </div>
            <div className="absolute left-10 top-0 flex size-14 items-center justify-center rounded-full border-[3px] border-fb-page bg-fb-trust-soft text-[22px] font-bold tracking-[-0.020em] text-fb-trust-ink">
              +
            </div>
          </div>

          <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.10em] text-fb-trust">
            초대가 도착했어요
          </p>
          <h1 className="text-[28px] font-bold leading-[1.28] tracking-[-0.024em] text-fb-ink">
            부부 워크스페이스에<br />
            함께 들어와 주세요.
          </h1>
          <p className="mt-4 text-[15px] font-medium leading-[1.55] text-fb-ink-2">
            매일 쓰는 가계부가 아니에요.<br />
            월 1회, 큰 숫자 몇 개만 같이 보면 돼요.
          </p>

          <Card tone="alt" className="mt-7 p-4">
            <div className="flex flex-col gap-3">
              <ReassureRow text="초대한 계정의 입력 내역은 보이지 않아요." />
              <ReassureRow text="내 숫자도 합산 결과로만 표시돼요." />
              <ReassureRow text="언제든 워크스페이스에서 나갈 수 있어요." />
            </div>
          </Card>
        </div>

        <div className="flex-1" />

        <div className="flex flex-col gap-2.5">
          <div data-od-id="cta-primary">
            <Button variant="inverse" size="lg" full href={`/invite/${token}/lite`}>
              워크스페이스 참여하기
            </Button>
          </div>
          <div data-od-id="cta-secondary">
            <Button variant="ghost" size="md" full href="/">
              나중에 할게요
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-[14px] border border-fb-line bg-fb-card-alt p-4">
          <h2 className="text-[16px] font-bold tracking-[-0.012em] text-fb-ink">
            입력은 3개만 필요해요
          </h2>
          <p className="mt-2 text-[13px] font-medium leading-[1.55] text-fb-ink-2">
            세후 월수입, 반복지출, 정기저축/투자만 입력하면 이번 달 가족 결과에 합산돼요.
            개별 입력값은 리드 파트너에게 따로 노출되지 않아요.
          </p>
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
