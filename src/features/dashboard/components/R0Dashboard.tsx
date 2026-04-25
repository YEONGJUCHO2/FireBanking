import { formatKrw, formatMonth } from "@/src/lib/format";

type R0Snapshot = {
  month: string;
  total_income: number;
  investable_net_worth: number;
  primary_residence_net_worth: number;
  other_net_worth: number;
  total_net_worth_for_display: number;
  fire_calculation_net_worth: number;
  fixed_expense: number;
  variable_expense: number;
  regular_investment: number;
  remaining_cash: number;
  monthly_asset_growth_capacity: number;
  annual_fire_expense: number;
  fire_target_asset: number;
  projected_fire_date: string | null;
};

export function R0Dashboard({ snapshot }: { snapshot: R0Snapshot }) {
  const rows = [
    ["우리 가족 표시 순자산", snapshot.total_net_worth_for_display],
    ["FIRE 계산 순자산", snapshot.fire_calculation_net_worth],
    ["거주 부동산 순자산", snapshot.primary_residence_net_worth],
    ["월 세후수입", snapshot.total_income],
    ["월 생활비", snapshot.fixed_expense + snapshot.variable_expense],
    ["월 정기저축/투자", snapshot.regular_investment],
    ["월 자산 증가 여력", snapshot.monthly_asset_growth_capacity],
    ["FIRE 목표 자산", snapshot.fire_target_asset],
  ] as const;

  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <p className="text-sm font-medium text-emerald-700">
          {formatMonth(snapshot.month)} 기준
        </p>
        <h1 className="text-3xl font-bold tracking-normal">경제적 자유까지 남은 거리</h1>
        <p className="text-base text-slate-700">
          투자가능 순자산 기준 예상 도달 시점은{" "}
          <strong className="text-slate-950">{formatMonth(snapshot.projected_fire_date)}</strong>{" "}
          입니다.
        </p>
        <p className="text-sm leading-6 text-slate-600">
          거주 부동산은 표시 순자산에는 포함하지만 R0 FIRE 계산에서는 제외합니다. 연 5%, 25배 룰
          기준의 참고용 시뮬레이션이며 투자 자문이 아닙니다.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{formatKrw(value)}</p>
          </div>
        ))}
      </section>

      {snapshot.projected_fire_date ? null : (
        <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          현재 입력 기준으로는 목표 도달 시점을 계산하기 어려워요. 월 자산 증가 여력이 생기면
          예상일을 보여드릴 수 있어요.
        </p>
      )}
    </div>
  );
}
