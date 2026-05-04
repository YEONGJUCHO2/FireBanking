"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  accountCategorySchema,
  quantityInput,
  requireAdminSupabase,
  type AssetActionState,
} from "./assetActionHelpers";

const knownInstruments = {
  "005930": { symbol: "005930", displayName: "삼성전자", instrumentType: "stock" },
  "003670": { symbol: "003670", displayName: "포스코퓨처엠", instrumentType: "stock" },
  "005490": { symbol: "005490", displayName: "포스코홀딩스", instrumentType: "stock" },
  "360750": { symbol: "360750", displayName: "TIGER 미국S&P500", instrumentType: "etf" },
  "379810": { symbol: "379810", displayName: "KODEX 미국나스닥100", instrumentType: "etf" },
} as const;

const saveKnownDomesticHoldingSchema = z.object({
  coupleId: z.string().min(1, "워크스페이스 정보를 찾지 못했습니다."),
  symbol: z.enum(["005930", "003670", "005490", "360750", "379810"]),
  quantity: quantityInput,
  accountCategory: accountCategorySchema,
});

export async function saveKnownDomesticHolding(
  _state: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const parsed = saveKnownDomesticHoldingSchema.safeParse({
    coupleId: formData.get("coupleId"),
    symbol: formData.get("symbol"),
    quantity: formData.get("quantity"),
    accountCategory: formData.get("accountCategory") ?? "general",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const auth = await requireAdminSupabase(parsed.data.coupleId);
  if ("error" in auth) {
    return { error: auth.error };
  }

  const known = knownInstruments[parsed.data.symbol];
  const { data: instrument, error: instrumentError } = await auth.supabase
    .from("asset_instruments")
    .upsert(
      {
        market: "KR",
        symbol: known.symbol,
        display_name: known.displayName,
        instrument_type: known.instrumentType,
        currency: "KRW",
      },
      { onConflict: "market,symbol" },
    )
    .select("id")
    .single();

  if (instrumentError || !instrument) {
    return { error: "종목 검색 결과를 저장하지 못했습니다." };
  }

  const { error } = await auth.supabase.from("asset_holdings").insert({
    couple_id: parsed.data.coupleId,
    instrument_id: instrument.id,
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
