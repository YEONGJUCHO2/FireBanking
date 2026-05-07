"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export type SaveLiteCheckinState = {
  error?: string;
  success?: boolean;
};

const manwonInput = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const normalized = value.replaceAll(",", "").trim();
    return normalized === "" ? undefined : Number(normalized);
  },
  z
    .number({
      invalid_type_error: "숫자로 입력해주세요.",
      required_error: "숫자로 입력해주세요.",
    })
    .min(0, "0만원 이상으로 입력해주세요.")
    .transform((value) => value * 10_000),
);

const saveLiteCheckinSchema = z.object({
  token: z.string().min(1, "초대 링크가 올바르지 않습니다."),
  incomeMan: manwonInput,
  expenseMan: manwonInput,
  savingsMan: manwonInput,
});

function currentMonthDate() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export async function saveLiteCheckin(
  _state: SaveLiteCheckinState,
  formData: FormData,
): Promise<SaveLiteCheckinState> {
  const parsed = saveLiteCheckinSchema.safeParse({
    token: formData.get("token"),
    incomeMan: formData.get("incomeMan"),
    expenseMan: formData.get("expenseMan"),
    savingsMan: formData.get("savingsMan"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다. 먼저 로그인한 뒤 초대 링크로 다시 들어와 주세요." };
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

  const { data: acceptResult, error: acceptError } = await supabase.rpc("accept_couple_invite", {
    invite_token: parsed.data.token,
  });

  if (acceptError) {
    return { error: "초대 수락 중 오류가 발생했습니다." };
  }

  if (acceptResult !== "accepted" && acceptResult !== "already_member") {
    return { error: "초대 링크가 만료되었거나 사용할 수 없습니다. 새 링크를 요청해주세요." };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .eq("role", "lite")
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError || !membership?.couple_id) {
    return { error: "배우자 워크스페이스 연결을 확인하지 못했습니다." };
  }

  const { error: checkinError } = await supabase.from("partner_lite_checkins").upsert(
    {
      couple_id: membership.couple_id,
      user_id: user.id,
      month: currentMonthDate(),
      income_amount: parsed.data.incomeMan,
      expense_amount: parsed.data.expenseMan,
      savings_amount: parsed.data.savingsMan,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "couple_id,user_id,month" },
  );

  if (checkinError) {
    return { error: "배우자 체크인을 저장하지 못했습니다." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/together");
  return { success: true };
}
