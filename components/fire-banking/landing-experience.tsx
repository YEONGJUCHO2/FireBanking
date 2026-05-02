import { BrandLockup } from './brand'
import { Button } from './button'
import { Icon } from './icons'
import { MobileAppShell } from './app-shell'

/**
 * Calm entry screen (was the marketing landing).
 * Mirrors design `Fire Banking.html` ScreenLogin: monochrome surface,
 * #0066FF accent eyebrow, two-CTA stack (Gmail + Kakao), reassurance row.
 */
export function LandingExperience() {
  return (
    <MobileAppShell>
      <section className="flex flex-1 flex-col px-6 pb-8 pt-14">
        <BrandLockup />

        <div className="mt-20">
          <p className="mb-3.5 text-[12px] font-semibold uppercase tracking-[0.10em] text-fb-trust">
            월 1회 · 3분 · 부부
          </p>
          <h1 className="text-[30px] font-bold leading-[1.25] tracking-[-0.024em] text-fb-ink">
            같은 숫자를 보면<br />
            돈 이야기가<br />
            조금 덜 불편해져요.
          </h1>
          <p className="mt-5 text-[15px] font-medium leading-[1.55] tracking-[-0.004em] text-fb-ink-2">
            부부가 함께 순자산과 경제적 자유 진척을<br />
            확인하는 월간 재무 체크인 앱이에요.
          </p>
        </div>

        <div className="flex-1" />

        <div className="mb-4 flex items-center gap-2 text-[12px] font-medium text-fb-ink-3">
          <span>가계부 아님</span>
          <span aria-hidden>·</span>
          <span>매일 입력 안 함</span>
          <span aria-hidden>·</span>
          <span>지난달 값 재사용</span>
        </div>

        <div className="flex flex-col gap-2.5">
          <Button
            variant="inverse"
            size="lg"
            full
            href="/onboarding"
            iconLeft={<GoogleMailMark />}
          >
            G-mail로 시작하기
          </Button>
          <Button variant="kakao" size="lg" full href="/onboarding" iconLeft={<Icon name="kakao" className="size-[18px]" />}>
            카카오로 계속하기
          </Button>
        </div>

        <p className="mt-4 text-center text-[12px] font-medium leading-[1.5] text-fb-ink-3">
          계속 진행하면{' '}
          <span className="font-semibold text-fb-ink underline underline-offset-[3px]">이용약관</span>과<br />
          <span className="font-semibold text-fb-ink underline underline-offset-[3px]">개인정보 처리방침</span>에 동의하게 돼요.
        </p>
      </section>
    </MobileAppShell>
  )
}

function GoogleMailMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="shrink-0">
      <path d="M4.5 6.5v11h3.2V9.9L12 13.1l4.3-3.2v7.6h3.2v-11L12 12.1 4.5 6.5Z" fill="#FFFFFF" />
      <path d="M4.5 6.5 12 12.1l7.5-5.6v2.9L12 15 4.5 9.4V6.5Z" fill="#EA4335" />
      <path d="M4.5 9.4v8.1h3.2v-5.7L4.5 9.4Z" fill="#34A853" />
      <path d="M16.3 11.8v5.7h3.2V9.4l-3.2 2.4Z" fill="#4285F4" />
      <path d="M4.5 6.5 12 12.1l2.1-1.6L6.8 5H5.7C5 5 4.5 5.6 4.5 6.5Z" fill="#FBBC04" />
      <path d="M17.2 5 12 8.9l7.5-2.4C19.5 5.6 19 5 18.3 5h-1.1Z" fill="#C5221F" />
    </svg>
  )
}
