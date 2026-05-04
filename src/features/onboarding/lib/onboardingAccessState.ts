import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export type OnboardingAccessState = {
  canStartOnboarding: boolean;
};

export async function getOnboardingAccessState(): Promise<OnboardingAccessState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { canStartOnboarding: true };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("couple_members")
    .select("couple_id, role")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.couple_id) {
    return { canStartOnboarding: true };
  }

  return { canStartOnboarding: false };
}
