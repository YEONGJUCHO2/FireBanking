import { Card } from './card'
import { Icon } from './icons'

export function InviteCard({
  spouseName = '배우자',
  inviteUrl = 'firebanking.app/invite/3a91…',
  daysLeft = 7,
}: {
  spouseName?: string
  inviteUrl?: string
  daysLeft?: number
}) {
  return (
    <Card tone="inverse" className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-white/12">
          <Icon name="users" className="size-[22px] text-white" />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-bold tracking-[-0.008em] text-white">
            {spouseName}님이 아직 초대 수락 전이에요
          </div>
          <div className="mt-0.5 text-[12px] font-medium text-white/60">
            링크는 {daysLeft}일간 유효해요
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-[12px] bg-white/8 p-3">
        <span className="fb-num flex-1 truncate text-[13px] font-medium tracking-[0.008em] text-white/85">
          {inviteUrl}
        </span>
        <button
          type="button"
          className="fbpress flex h-8 items-center gap-1 rounded-full bg-white/16 px-3 text-[12px] font-bold text-white"
        >
          <Icon name="copy" className="size-3.5" />
          복사
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <DarkSecondaryButton iconName="kakao">카카오톡 공유</DarkSecondaryButton>
        <DarkSecondaryButton iconName="share">다른 앱으로</DarkSecondaryButton>
      </div>
    </Card>
  )
}

function DarkSecondaryButton({
  children,
  iconName,
}: {
  children: React.ReactNode
  iconName: 'kakao' | 'share'
}) {
  return (
    <button
      type="button"
      className="fbpress flex h-10 items-center justify-center gap-1.5 rounded-[12px] border border-white/15 bg-white/10 text-[13px] font-semibold text-white"
    >
      <Icon name={iconName} className="size-4" />
      {children}
    </button>
  )
}
