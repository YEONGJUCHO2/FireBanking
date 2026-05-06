import { BrandLockup } from './brand'
import { MobileAppShell } from './app-shell'
import { SignInButton } from '@/src/features/auth/components/SignInButton'

/**
 * Calm entry screen content. Same markup is rendered both at `/` (real page,
 * via LandingExperience) and inside the /showcase phone frame (LoginScreenPreview)
 * so the two surfaces stay pixel-aligned.
 *
 * authError — populated from /?error=auth_callback_* redirect when OAuth fails.
 */
export function LoginScreenContent({ authError }: { authError?: string | null } = {}) {
  return (
    <section
      data-screen-label="login"
      className="flex flex-1 flex-col px-6 pb-8 pt-14"
    >
      <div data-od-id="brand-lockup">
        <BrandLockup />
      </div>

      <div data-od-id="product-definition" className="mt-20">
        <p className="mb-3.5 text-[12px] font-semibold uppercase tracking-[0.10em] text-fb-trust">
          월 1회 · 3분 · 부부
        </p>
        <h1 className="text-[30px] font-bold leading-[1.25] tracking-[-0.024em] text-fb-ink">
          같은 숫자를 보면<br />
          돈 이야기가<br />
          조금 덜 불편해져요.
        </h1>
        <h2 className="mt-5 text-[15px] font-medium leading-[1.55] tracking-[-0.004em] text-fb-ink-2">
          부부가 함께 순자산과 경제적 자유 진척을<br />
          확인하는 월간 재무 체크인 앱이에요.
        </h2>
      </div>

      <div className="flex-1" />

      <div className="mb-4 flex items-center gap-2 text-[12px] font-medium text-fb-ink-3">
        <span>가계부 아님</span>
        <span aria-hidden>·</span>
        <span>매일 입력 안 함</span>
        <span aria-hidden>·</span>
        <span>지난달 값 재사용</span>
      </div>

      {authError ? (
        <div
          data-od-id="auth-error"
          role="alert"
          className="mb-3 rounded-[12px] border border-fb-cautionary-soft bg-fb-cautionary-soft px-4 py-3 text-[13px] font-medium leading-[1.5] text-fb-cautionary-ink"
        >
          로그인 중 문제가 생겼어요. 다시 시도해 주세요.
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5">
        <div data-od-id="cta-google-signin">
          <SignInButton />
        </div>
      </div>

      <p className="mt-4 text-center text-[12px] font-medium leading-[1.5] text-fb-ink-3">
        계속 진행하면{' '}
        <span className="font-semibold text-fb-ink underline underline-offset-[3px]">이용약관</span>과<br />
        <span className="font-semibold text-fb-ink underline underline-offset-[3px]">개인정보 처리방침</span>에 동의하게 돼요.
      </p>
    </section>
  )
}

export function LandingExperience({ authError }: { authError?: string | null } = {}) {
  return (
    <MobileAppShell>
      <LoginScreenContent authError={authError} />
    </MobileAppShell>
  )
}
