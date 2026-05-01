"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  liabilityPurposeSchema,
  manwonInput,
  requireAdminSupabase,
  type AssetActionState,
} from "./assetActionHelpers";

const saveLiabilitySchema = z.object({
  coupleId: z.string().min(1, "워크스페이스 정보를 찾지 못했습니다."),
  purpose: liabilityPurposeSchema,
  balanceAmount: manwonInput("부채 잔액을 입력해주세요."),
  monthlyInterestAmount: manwonInput("월 이자를 입력해주세요."),
  monthlyPrincipalAmount: manwonInput("월 원금상환액을 입력해주세요."),
});

export async function saveLiability(
  _state: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const parsed = saveLiabilitySchema.safeParse({
    coupleId: formData.get("coupleId"),
    purpose: formData.get("purpose"),
    balanceAmount: formData.get("balanceAmount"),
    monthlyInterestAmount: formData.get("monthlyInterestAmount"),
    monthlyPrincipalAmount: formData.get("monthlyPrincipalAmount"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const auth = await requireAdminSupabase(parsed.data.coupleId);
  if ("error" in auth) {
    return { error: auth.error };
  }

  const { error } = await auth.supabase.from("asset_liabilities").insert({
    couple_id: parsed.data.coupleId,
    purpose: parsed.data.purpose,
    balance_amount: parsed.data.balanceAmount,
    monthly_interest_amount: parsed.data.monthlyInterestAmount,
    monthly_principal_amount: parsed.data.monthlyPrincipalAmount,
    created_by: auth.user.id,
  });

  if (error) {
    return { error: "부채를 저장하지 못했습니다." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
