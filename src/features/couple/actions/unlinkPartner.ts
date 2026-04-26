"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export type UnlinkPartnerState = {
  error?: string;
};

const unlinkPartnerErrors: Record<string, string> = {
  login_required: "로그인이 필요합니다.",
  not_admin: "관리자 계정만 배우자 연동을 해제할 수 있습니다.",
  no_partner: "연결된 배우자 계정을 찾지 못했습니다.",
};

export async function unlinkPartner(formData: FormData): Promise<UnlinkPartnerState> {
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

  const { data, error } = await supabase.rpc("unlink_couple_partner", {
    target_couple_id: coupleId,
  });

  if (error) {
    return { error: "배우자 연동을 해제하지 못했습니다." };
  }

  if (data !== "unlinked") {
    return { error: unlinkPartnerErrors[String(data)] ?? "배우자 연동을 해제하지 못했습니다." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function unlinkPartnerFormAction(formData: FormData): Promise<void> {
  await unlinkPartner(formData);
}
