"use server";

import { revalidatePath } from "next/cache";
import { createInviteToken } from "@/src/features/couple/lib/inviteToken";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export type CreateInviteLinkState = {
  error?: string;
  inviteUrl?: string;
};

export async function createInviteLink(
  _state: CreateInviteLinkState,
  formData: FormData,
): Promise<CreateInviteLinkState> {
  const coupleId = String(formData.get("coupleId") ?? "");

  if (!coupleId) {
    return { error: "워크스페이스 정보를 찾지 못했습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const { count: connectedPartnerCount, error: memberCountError } = await supabase
    .from("couple_members")
    .select("user_id", { count: "exact", head: true })
    .eq("couple_id", coupleId)
    .eq("role", "lite");

  if (memberCountError) {
    return { error: "초대 상태를 확인하지 못했습니다." };
  }

  if ((connectedPartnerCount ?? 0) > 0) {
    return { error: "이미 배우자 계정이 연결되어 있습니다. 연동 해제 후 다시 초대해주세요." };
  }

  const token = createInviteToken();
  const { error } = await supabase.from("couple_invites").insert({
    couple_id: coupleId,
    created_by: user.id,
    token,
  });

  if (error) {
    return { error: "초대 링크를 만들지 못했습니다." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/together");

  return { inviteUrl: `/invite/${token}` };
}
