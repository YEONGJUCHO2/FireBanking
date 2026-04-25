import { SignInButton } from "@/src/features/auth/components/SignInButton";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-slate-950">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <section className="flex flex-col gap-4">
          <p className="text-sm font-medium text-emerald-700">월 1회 3분</p>
          <h1 className="text-4xl font-bold tracking-normal">
            부부가 함께 순자산과 경제적 자유 진척을 확인하는 앱
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-700">
            R0에서는 먼저 혼자 총액을 입력하고 기본 FIRE 결과를 확인한 뒤, 배우자에게 공유할 링크를
            만들 수 있습니다. 배우자의 가입과 Lite 체크인은 다음 릴리즈에서 붙입니다.
          </p>
        </section>
        <SignInButton />
      </div>
    </main>
  );
}
