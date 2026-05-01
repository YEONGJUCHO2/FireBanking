import { InvitePartnerCard } from "@/src/features/couple/components/InvitePartnerCard";
import { unlinkPartnerFormAction } from "@/src/features/couple/actions/unlinkPartner";

function ConnectedPartnerCard({ coupleId }: { coupleId: string }) {
  return (
    <section className="rounded-card border border-fb-trust/20 bg-fb-trust-soft p-5 shadow-card">
      <p className="text-sm font-bold text-fb-trust">배우자 연결됨</p>
      <p className="mt-2 text-sm leading-6 text-fb-ink-2">
        배우자가 읽기 전용으로 같은 FIRE 결과를 확인할 수 있어요. 잘못 초대했다면 연동을 해제한 뒤
        새 초대 링크를 만들 수 있습니다.
      </p>
      <form action={unlinkPartnerFormAction} className="mt-4">
        <input type="hidden" name="coupleId" value={coupleId} />
        <button
          type="submit"
          className="fb-focus rounded-button border border-fb-trust/30 bg-white px-4 py-2 text-sm font-bold text-fb-trust hover:bg-fb-trust-soft"
        >
          연동 해제
        </button>
      </form>
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
    return <ConnectedPartnerCard coupleId={coupleId} />;
  }

  return <InvitePartnerCard coupleId={coupleId} latestInviteUrl={latestInviteUrl} />;
}
