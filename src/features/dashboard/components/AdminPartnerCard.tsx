import { InvitePartnerCard } from "@/src/features/couple/components/InvitePartnerCard";

function ConnectedPartnerCard() {
  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-medium text-emerald-800">배우자 연결됨</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        배우자가 읽기 전용으로 같은 FIRE 결과를 확인할 수 있어요. 새 초대 링크는 배우자 연결이
        해제되거나 추가 초대 정책을 정한 뒤 다시 열어둘게요.
      </p>
    </section>
  );
}

export function AdminPartnerCard({
  coupleId,
  connectedPartnerCount,
  latestInviteUrl,
}: {
  coupleId: string;
  connectedPartnerCount: number;
  latestInviteUrl?: string;
}) {
  if (connectedPartnerCount > 0) {
    return <ConnectedPartnerCard />;
  }

  return <InvitePartnerCard coupleId={coupleId} latestInviteUrl={latestInviteUrl} />;
}
