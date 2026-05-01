import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export type AssetActionState = {
  error?: string;
  success?: boolean;
};

export const accountCategorySchema = z.enum(["general", "pension_savings", "irp", "other"]);
export const liabilityPurposeSchema = z.enum([
  "residence",
  "investment",
  "lifestyle_credit",
  "other",
]);

const stripCommaString = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.replaceAll(",", "").trim();
};

export const quantityInput = z.preprocess(
  (value) => {
    const normalized = stripCommaString(value);
    return normalized === "" || normalized === null || normalized === undefined
      ? undefined
      : Number(normalized);
  },
  z
    .number({
      invalid_type_error: "보유 수량을 입력해주세요.",
      required_error: "보유 수량을 입력해주세요.",
    })
    .positive("보유 수량을 입력해주세요."),
);

export function manwonInput(message: string) {
  return z.preprocess(
    (value) => {
    const normalized = stripCommaString(value);
    return normalized === "" || normalized === null || normalized === undefined
      ? undefined
      : Number(normalized);
  },
    z
      .number({
        invalid_type_error: message,
        required_error: message,
      })
      .min(0, "0만원 이상으로 입력해주세요.")
      .transform((value) => value * 10_000),
  );
}

export async function requireAdminSupabase(coupleId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." as const };
  }

  const { data, error } = await supabase
    .from("couple_members")
    .select("id")
    .eq("couple_id", coupleId)
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (error || !data) {
    return { error: "관리자 계정만 자산과 부채를 수정할 수 있습니다." as const };
  }

  return { supabase, user };
}

export async function ensureActiveDomesticInstrument(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  instrumentId: string,
) {
  const { data, error } = await supabase
    .from("asset_instruments")
    .select("id")
    .eq("id", instrumentId)
    .eq("market", "KR")
    .eq("is_active", true)
    .maybeSingle();

  return !error && Boolean(data);
}
