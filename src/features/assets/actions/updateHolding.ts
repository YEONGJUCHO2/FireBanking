"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  accountCategorySchema,
  quantityInput,
  requireAdminSupabase,
  type AssetActionState,
} from "./assetActionHelpers";

const updateHoldingSchema = z.object({
  coupleId: z.string().min(1, "워크스페이스 정보를 찾지 못했습니다."),
  holdingId: z.string().min(1, "보유 종목을 찾지 못했습니다."),
  quantity: quantityInput,
  accountCategory: accountCategorySchema,
});

export async function updateHolding(
  _state: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const parsed = updateHoldingSchema.safeParse({
    coupleId: formData.get("coupleId"),
    holdingId: formData.get("holdingId"),
    quantity: formData.get("quantity"),
    accountCategory: formData.get("accountCategory"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const auth = await requireAdminSupabase(parsed.data.coupleId);
  if ("error" in auth) {
    return { error: auth.error };
  }

  const { error } = await auth.supabase
    .from("asset_holdings")
    .update({
      quantity: parsed.data.quantity,
      account_category: parsed.data.accountCategory,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.holdingId)
    .eq("couple_id", parsed.data.coupleId);

  if (error) {
    return { error: "보유 종목을 수정하지 못했습니다." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
