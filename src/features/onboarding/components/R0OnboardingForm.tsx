"use client";

import { ChangeEvent, useActionState, useState } from "react";
import {
  saveR0Snapshot,
  type SaveR0SnapshotState,
} from "@/src/features/onboarding/actions/saveR0Snapshot";

const initialState: SaveR0SnapshotState = {};

const fields = [
  [
    "targetMonthlyExpense",
    "목표 월 생활비",
    "300",
    "만원 단위입니다. 은퇴 후 매달 쓰고 싶은 생활비이며 FIRE 목표자산의 기준입니다.",
    true,
  ],
  [
    "monthlyNetIncome",
    "가구 세후 월수입",
    "720",
    "만원 단위로 입력합니다. 보너스가 있다면 평소 한 달 기준으로 대략 입력하세요.",
    true,
  ],
  [
    "investableNetWorth",
    "내 투자가능 순자산",
    "12000",
    "만원 단위입니다. 현금성 자산, 주식, ETF처럼 FIRE 생활비를 만들 수 있는 자산입니다.",
    true,
  ],
  [
    "monthlyTotalExpense",
    "가구 월 총지출",
    "400",
    "만원 단위입니다. 고정비와 변동비를 나누지 않고 첫 FIRE 거리감을 보는 총액입니다.",
    true,
  ],
] as const;

type FieldName = (typeof fields)[number][0];
export type R0OnboardingInitialValues = Partial<Record<FieldName, number>>;

function formatManwonInput(value: string) {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return Number(digits).toLocaleString("ko-KR");
}

function formatKrwAsManwonInput(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "";
  }

  return Math.round(value / 10_000).toLocaleString("ko-KR");
}

type ManwonInputProps = {
  name: FieldName;
  label: string;
  placeholder: string;
  required: boolean;
  initialValue?: number;
};

function ManwonInput({ name, label, placeholder, required, initialValue }: ManwonInputProps) {
  const [value, setValue] = useState(() => formatKrwAsManwonInput(initialValue));

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(formatManwonInput(event.target.value));
  }

  return (
    <div className="flex items-center rounded-soft border border-fb-line bg-white shadow-inner-soft focus-within:border-fb-trust focus-within:ring-4 focus-within:ring-fb-trust/15">
      <input
        required={required}
        inputMode="numeric"
        name={name}
        aria-label={label}
        value={value}
        onChange={handleChange}
        placeholder={formatManwonInput(placeholder)}
        className="min-w-0 flex-1 rounded-soft bg-transparent px-4 py-3 text-right text-base font-semibold text-fb-ink outline-none placeholder:text-fb-ink-3"
      />
      <span className="shrink-0 px-4 text-sm font-bold text-fb-ink-2">만원</span>
    </div>
  );
}

type R0OnboardingFormProps = {
  initialValues?: R0OnboardingInitialValues;
};

export function R0OnboardingForm({ initialValues = {} }: R0OnboardingFormProps) {
  const [state, formAction, pending] = useActionState(saveR0Snapshot, initialState);

  return (
    <form action={formAction} className="grid gap-5">
      <div className="flex items-center justify-between rounded-card border border-fb-line bg-fb-trust-soft px-4 py-3 text-sm text-fb-ink-2">
        <span>입력 단위</span>
        <strong className="text-fb-trust">10,000원</strong>
      </div>
      {fields.map(([name, label, placeholder, help, required]) => (
        <label key={name} className="grid gap-2">
          <span className="text-sm font-bold text-fb-ink">{label}</span>
          <ManwonInput
            name={name}
            label={label}
            placeholder={placeholder}
            required={required}
            initialValue={initialValues[name]}
          />
          <span className="text-xs leading-5 text-fb-ink-2">{help}</span>
        </label>
      ))}

      {state.error ? (
        <p className="rounded-soft bg-fb-negative-soft px-4 py-3 text-sm text-fb-negative">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="fb-focus h-14 rounded-button bg-fb-trust px-4 py-3 text-sm font-bold text-white shadow-card hover:bg-fb-trust-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "계산 중..." : "다음"}
      </button>
    </form>
  );
}
