"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  accountCategorySchema,
  ensureActiveDomesticInstrument,
  quantityInput,
  requireAdminSupabase,
  type AssetActionState,
} from "./assetActionHelpers";

const saveHoldingSchema = z.object({
  coupleId: z.string().min(1, "워크스페이스 정보를 찾지 못했습니다."),
  instrumentId: z.string().min(1, "종목 검색 결과에서 보유 종목을 선택해주세요."),
  quantity: quantityInput,
  accountCategory: accountCategorySchema,
});

export async function saveHolding(
  _state: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const parsed = saveHoldingSchema.safeParse({
    coupleId: formData.get("coupleId"),
    instrumentId: formData.get("instrumentId"),
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

  const hasInstrument = await ensureActiveDomesticInstrument(auth.supabase, parsed.data.instrumentId);
  if (!hasInstrument) {
    return { error: "종목 검색 결과에서 보유 종목을 선택해주세요." };
  }

  const { error } = await auth.supabase.from("asset_holdings").insert({
    couple_id: parsed.data.coupleId,
    instrument_id: parsed.data.instrumentId,
    quantity: parsed.data.quantity,
    account_category: parsed.data.accountCategory,
    created_by: auth.user.id,
  });

  if (error) {
    return { error: "보유 종목을 저장하지 못했습니다." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/assets");
  return { success: true };
}
