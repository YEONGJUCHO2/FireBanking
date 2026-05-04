import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export type DashboardPartnerState =
  | { state: "no_workspace" }
  | {
      state: "needs_invite" | "waiting_for_input" | "complete";
      coupleId: string;
      connectedPartnerCount: number;
      latestInviteUrl?: string;
    };

function currentMonthDate() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export async function getDashboardPartnerState(): Promise<DashboardPartnerState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { state: "no_workspace" };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.couple_id) {
    return { state: "no_workspace" };
  }

  const coupleId = String(membership.couple_id);
  const { data: partnerRows, error: partnerError } = await supabase
    .from("couple_members")
    .select("user_id")
    .eq("couple_id", coupleId)
    .eq("role", "lite");

  if (partnerError) {
    return { state: "no_workspace" };
  }

  const partnerIds = ((partnerRows ?? []) as Array<{ user_id?: string | null }>)
    .map((row) => row.user_id)
    .filter((id): id is string => Boolean(id));

  const latestInviteUrl = await getLatestInviteUrl(supabase, coupleId);

  if (partnerIds.length === 0) {
    return {
      state: "needs_invite",
      coupleId,
      connectedPartnerCount: 0,
      latestInviteUrl,
    };
  }

  const { data: snapshotRows, error: snapshotError } = await supabase
    .from("monthly_cashflow_snapshots")
    .select("created_by")
    .eq("couple_id", coupleId)
    .eq("month", currentMonthDate())
    .in("created_by", partnerIds);

  if (snapshotError) {
    return {
      state: "waiting_for_input",
      coupleId,
      connectedPartnerCount: partnerIds.length,
      latestInviteUrl,
    };
  }

  const hasPartnerSnapshot = (snapshotRows ?? []).length > 0;

  return {
    state: hasPartnerSnapshot ? "complete" : "waiting_for_input",
    coupleId,
    connectedPartnerCount: partnerIds.length,
    latestInviteUrl,
  };
}

async function getLatestInviteUrl(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  coupleId: string,
) {
  const { data } = await supabase
    .from("couple_invites")
    .select("token")
    .eq("couple_id", coupleId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const token = (data as { token?: string } | null)?.token;
  return token ? `/invite/${token}` : undefined;
}
