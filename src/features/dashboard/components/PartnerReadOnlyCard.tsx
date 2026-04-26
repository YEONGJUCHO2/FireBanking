export function PartnerReadOnlyCard() {
  return (
    <section className="rounded-card border border-fb-green/20 bg-fb-green-50 p-5 shadow-card">
      <p className="text-sm font-bold text-fb-green">배우자로 연결됨</p>
      <p className="mt-2 text-sm leading-6 text-fb-muted">
        현재는 공동 FIRE 결과를 읽기 전용으로 확인할 수 있어요. 값 수정은 초대한 계정에서
        가능합니다.
      </p>
    </section>
  );
}
