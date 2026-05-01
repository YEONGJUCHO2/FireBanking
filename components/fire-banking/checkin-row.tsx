import { cn } from '@/lib/cn'

export type CheckinStatus = 'done' | 'pending' | 'invited'

const dotMap: Record<CheckinStatus, { color: string; text: string }> = {
  done: { color: 'bg-fb-positive', text: '체크인 완료' },
  pending: { color: 'bg-fb-cautionary', text: '입력 대기' },
  invited: { color: 'bg-fb-ink-4', text: '초대 보냄' },
}

export function CheckinRow({
  name,
  role,
  status,
  when,
}: {
  name: string
  role: 'admin' | 'lite'
  status: CheckinStatus
  when: string
}) {
  const { color, text } = dotMap[status]
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className={cn(
          'flex size-9 items-center justify-center rounded-full text-[13px] font-bold tracking-[-0.008em]',
          role === 'admin' ? 'bg-fb-ink text-white' : 'bg-fb-trust-soft text-fb-trust-ink',
        )}
      >
        {name.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold text-fb-ink">
          {name}{' '}
          <span className="font-medium text-fb-ink-3">
            · {role === 'admin' ? '리드 파트너' : '배우자'}
          </span>
        </div>
        <div className="mt-0.5 text-[12px] font-medium text-fb-ink-3">{when}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={cn('size-1.5 rounded-full', color)} />
        <span className="text-[12px] font-semibold text-fb-ink">{text}</span>
      </div>
    </div>
  )
}
