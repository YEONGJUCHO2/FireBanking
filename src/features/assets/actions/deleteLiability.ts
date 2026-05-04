"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSupabase, type AssetActionState } from "./assetActionHelpers";

const deleteLiabilitySchema = z.object({
  coupleId: z.string().min(1, "워크스페이스 정보를 찾지 못했습니다."),
  liabilityId: z.string().min(1, "부채 정보를 찾지 못했습니다."),
});

export async function deleteLiability(
  _state: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const parsed = deleteLiabilitySchema.safeParse({
    coupleId: formData.get("coupleId"),
    liabilityId: formData.get("liabilityId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const auth = await requireAdminSupabase(parsed.data.coupleId);
  if ("error" in auth) {
    return { error: auth.error };
  }

  const { error } = await auth.supabase
    .from("asset_liabilities")
    .delete()
    .eq("id", parsed.data.liabilityId)
    .eq("couple_id", parsed.data.coupleId);

  if (error) {
    return { error: "부채를 삭제하지 못했습니다." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/assets");
  return { success: true };
}
