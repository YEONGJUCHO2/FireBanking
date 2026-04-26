"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export type AcceptInviteState = {
  error?: string;
};

const acceptInviteErrors: Record<string, string> = {
  invalid_invite: "초대 링크가 올바르지 않습니다.",
  expired_invite: "만료된 초대 링크입니다. 새 링크를 요청해주세요.",
  unavailable_invite: "이미 사용되었거나 더 이상 사용할 수 없는 초대 링크입니다.",
  partner_already_connected: "이미 배우자 계정이 연결되어 있습니다. 관리자에게 새 초대를 요청해주세요.",
  login_required: "로그인이 필요합니다.",
};

export async function acceptInvite(
  _state: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const token = String(formData.get("token") ?? "");

  if (!token) {
    return { error: "초대 링크가 올바르지 않습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const displayName = user.user_metadata.full_name ?? user.email ?? "배우자";
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    display_name: displayName,
  });

  if (profileError) {
    return { error: "프로필을 저장하지 못했습니다." };
  }

  const { data, error } = await supabase.rpc("accept_couple_invite", { invite_token: token });

  if (error) {
    return { error: "초대 수락 중 오류가 발생했습니다." };
  }

  if (data !== "accepted" && data !== "already_member") {
    return { error: acceptInviteErrors[String(data)] ?? "초대 수락 중 오류가 발생했습니다." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
