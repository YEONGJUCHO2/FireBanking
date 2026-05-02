export function PartnerReadOnlyCard() {
  return (
    <section className="rounded-card border border-fb-trust/20 bg-fb-trust-soft p-5 shadow-card">
      <p className="text-sm font-bold text-fb-trust">배우자로 연결됨</p>
      <p className="mt-2 text-sm leading-6 text-fb-ink-2">
        현재는 공동 FIRE 결과를 읽기 전용으로 확인할 수 있어요. 값 수정은 초대한 계정에서
        가능합니다.
      </p>
    </section>
  );
}
