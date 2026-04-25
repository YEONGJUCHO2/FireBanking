import { z } from "zod";

const stripCommaString = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.replaceAll(",", "").trim();
};

const requiredManwonInput = z.preprocess(
  (value) => {
    const normalized = stripCommaString(value);
    return normalized === "" || normalized === null || normalized === undefined
      ? undefined
      : normalized;
  },
  z.coerce
    .number({
      invalid_type_error: "숫자로 입력해주세요.",
    })
    .int("만원 단위 정수로 입력해주세요.")
    .min(0, "0만원 이상으로 입력해주세요.")
    .transform((value) => value * 10_000),
);

const optionalManwonInput = z.preprocess((value) => {
  const normalized = stripCommaString(value);
  return normalized === "" || normalized === null || normalized === undefined ? 0 : normalized;
}, requiredManwonInput);

export const r0OnboardingSchema = z.object({
  monthlyNetIncome: requiredManwonInput,
  investableNetWorth: requiredManwonInput,
  primaryResidenceNetWorth: optionalManwonInput,
  otherNetWorth: optionalManwonInput,
  monthlyFixedExpense: requiredManwonInput,
  monthlyVariableExpense: requiredManwonInput,
  monthlyRegularInvestment: requiredManwonInput,
});

export type R0OnboardingInput = z.infer<typeof r0OnboardingSchema>;
