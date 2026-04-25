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

  return { inviteUrl: `/invite/${token}` };
}
