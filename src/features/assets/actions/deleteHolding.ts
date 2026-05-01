"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSupabase, type AssetActionState } from "./assetActionHelpers";

const deleteHoldingSchema = z.object({
  coupleId: z.string().min(1, "워크스페이스 정보를 찾지 못했습니다."),
  holdingId: z.string().min(1, "보유 종목을 찾지 못했습니다."),
});

export async function deleteHolding(
  _state: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const parsed = deleteHoldingSchema.safeParse({
    coupleId: formData.get("coupleId"),
    holdingId: formData.get("holdingId"),
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
    .delete()
    .eq("id", parsed.data.holdingId)
    .eq("couple_id", parsed.data.coupleId);

  if (error) {
    return { error: "보유 종목을 삭제하지 못했습니다." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
