"use client";

import { ChangeEvent, useActionState, useState } from "react";
import {
  saveR0Snapshot,
  type SaveR0SnapshotState,
} from "@/src/features/onboarding/actions/saveR0Snapshot";

const initialState: SaveR0SnapshotState = {};

const fields = [
  [
    "monthlyNetIncome",
    "가구 세후 월수입",
    "720",
    "만원 단위로 입력합니다. 보너스가 있다면 평소 한 달 기준으로 대략 입력하세요.",
    true,
  ],
  [
    "investableNetWorth",
    "투자가능 순자산",
    "12000",
    "만원 단위입니다. 예금, 주식, ETF, 연금저축 등 FIRE 계산에 넣을 자산입니다.",
    true,
  ],
  [
    "primaryResidenceNetWorth",
    "거주 부동산 순자산",
    "70000",
    "만원 단위입니다. 자가 시세에서 주담대를 뺀 금액입니다. 없거나 모르겠으면 비워도 괜찮아요.",
    false,
  ],
  [
    "otherNetWorth",
    "기타 순자산",
    "2000",
    "만원 단위입니다. 차량, 보증금, 애매한 자산입니다. 없거나 모르겠으면 비워도 괜찮아요.",
    false,
  ],
  [
    "monthlyFixedExpense",
    "가구 월 고정비 총액",
    "230",
    "만원 단위입니다. 주거비, 보험, 통신, 구독처럼 반복되는 비용입니다.",
    true,
  ],
  [
    "monthlyVariableExpense",
    "평소 한 달 예상 변동비",
    "170",
    "만원 단위입니다. 지난달 실제 지출이 아니라 보통 한 달에 쓸 금액입니다.",
    true,
  ],
  [
    "monthlyRegularInvestment",
    "월 정기저축/투자",
    "200",
    "만원 단위입니다. 매달 투자가능 자산으로 쌓이는 저축과 투자입니다.",
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
    <div className="flex items-center rounded-md border border-slate-300 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
      <input
        required={required}
        inputMode="numeric"
        name={name}
        aria-label={label}
        value={value}
        onChange={handleChange}
        placeholder={formatManwonInput(placeholder)}
        className="min-w-0 flex-1 rounded-md bg-transparent px-3 py-3 text-base outline-none"
      />
      <span className="shrink-0 px-3 text-sm font-medium text-slate-500">만원</span>
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
      {fields.map(([name, label, placeholder, help, required]) => (
        <label key={name} className="grid gap-2">
          <span className="text-sm font-medium text-slate-800">{label}</span>
          <ManwonInput
            name={name}
            label={label}
            placeholder={placeholder}
            required={required}
            initialValue={initialValues[name]}
          />
          <span className="text-xs leading-5 text-slate-500">{help}</span>
        </label>
      ))}

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "계산 중..." : "첫 FIRE 결과 보기"}
      </button>
    </form>
  );
}
