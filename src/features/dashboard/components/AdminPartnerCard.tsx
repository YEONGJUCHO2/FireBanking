import { InvitePartnerCard } from "@/src/features/couple/components/InvitePartnerCard";
import { unlinkPartnerFormAction } from "@/src/features/couple/actions/unlinkPartner";

function ConnectedPartnerCard({ coupleId }: { coupleId: string }) {
  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm font-medium text-emerald-800">배우자 연결됨</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        배우자가 읽기 전용으로 같은 FIRE 결과를 확인할 수 있어요. 잘못 초대했다면 연동을 해제한 뒤
        새 초대 링크를 만들 수 있습니다.
      </p>
      <form action={unlinkPartnerFormAction} className="mt-4">
        <input type="hidden" name="coupleId" value={coupleId} />
        <button
          type="submit"
          className="rounded-md border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
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
