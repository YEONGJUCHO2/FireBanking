import { SignInButton } from "@/src/features/auth/components/SignInButton";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 text-slate-950 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <section className="flex flex-col gap-4">
          <p className="text-sm font-medium text-emerald-700">월 1회 3분</p>
          <h1 className="text-3xl font-bold tracking-normal sm:text-4xl">
            부부가 함께 순자산과 경제적 자유 진척을 확인하는 앱
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-700">
            R0에서는 한 사람이 총액을 입력해 FIRE 결과를 만들고, 초대 링크나 카카오톡 공유로
            배우자에게 같은 대시보드를 연결할 수 있습니다.
          </p>
        </section>
        <SignInButton />
      </div>
    </main>
  );
}
