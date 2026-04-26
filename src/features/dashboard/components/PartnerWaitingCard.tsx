export function PartnerWaitingCard() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-900">아직 공유된 FIRE 결과가 없어요</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        초대한 계정에서 이번 달 값을 저장하면 이 대시보드에서 같은 FIRE 결과를 바로 확인할 수
        있어요.
      </p>
    </section>
  );
}
