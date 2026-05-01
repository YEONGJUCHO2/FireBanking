import { BrandLockup } from './brand'
import { Button } from './button'
import { Icon } from './icons'
import { MobileAppShell } from './app-shell'

/**
 * Calm entry screen (was the marketing landing).
 * Mirrors design `Fire Banking.html` ScreenLogin: monochrome surface,
 * #0066FF accent eyebrow, two-CTA stack (Google + email), reassurance row.
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
            iconLeft={<GoogleGlyph />}
          >
            Google로 계속하기
          </Button>
          <Button variant="secondary" size="lg" full href="/onboarding" iconLeft={<Icon name="mail" className="size-[18px]" />}>
            이메일로 시작하기
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

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#fff"
        d="M21.6 12.227c0-.708-.064-1.39-.18-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.227c1.886-1.736 2.986-4.295 2.986-7.351z"
      />
      <path
        fill="#fff"
        opacity="0.85"
        d="M12 22c2.7 0 4.964-.895 6.614-2.422l-3.227-2.51c-.895.6-2.04.954-3.387.954-2.605 0-4.81-1.762-5.595-4.13H3.067v2.59A9.997 9.997 0 0 0 12 22z"
      />
      <path
        fill="#fff"
        opacity="0.7"
        d="M6.405 13.892A6.003 6.003 0 0 1 6.09 12c0-.659.114-1.298.314-1.892V7.518H3.067A9.997 9.997 0 0 0 2 12c0 1.614.387 3.14 1.067 4.482l3.338-2.59z"
      />
      <path
        fill="#fff"
        opacity="0.55"
        d="M12 5.978c1.468 0 2.786.504 3.823 1.495l2.866-2.866C16.96 3.045 14.695 2 12 2 8.09 2 4.717 4.245 3.067 7.518l3.338 2.59C7.19 7.74 9.395 5.978 12 5.978z"
      />
    </svg>
  )
}
