export function PartnerReadOnlyCard() {
  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-medium text-emerald-800">배우자로 연결됨</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        현재는 공동 FIRE 결과를 읽기 전용으로 확인할 수 있어요. 값 수정은 초대한 계정에서
        가능합니다.
      </p>
    </section>
  );
}
