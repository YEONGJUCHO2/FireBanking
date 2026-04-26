import { Button } from './button'
import { Icon } from './icons'

export function InviteCard({ compact = false }: { compact?: boolean }) {
  return (
    <section className="fb-card overflow-hidden p-5">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-fb-sand text-fb-green">
          <Icon name="users" className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-fb-green">배우자 초대</p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.05em] text-fb-ink">배우자가 참여하면 이번 달 결과가 더 또렷해져요.</h2>
          {!compact ? <p className="mt-2 text-sm leading-6 text-fb-muted">서로를 평가하기보다, 같은 숫자를 보고 같은 편이 되는 체크인입니다.</p> : null}
        </div>
      </div>

      {!compact ? (
        <div className="mt-5 grid gap-2 text-sm leading-6 text-fb-muted">
          <div className="flex gap-2"><Icon name="check" className="mt-1 size-4 text-fb-green" />각자의 입력이 합쳐져 더 정확한 결과 제공</div>
          <div className="flex gap-2"><Icon name="shield" className="mt-1 size-4 text-fb-green" />프라이버시는 지키면서 함께 설계</div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-2">
        <Button href="/invite/demo-token">초대 링크 생성</Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary"><Icon name="copy" className="mr-2 size-4" />링크 복사</Button>
          <Button variant="kakao"><Icon name="kakao" className="mr-2 size-4" />카카오톡 공유</Button>
        </div>
      </div>
    </section>
  )
}
