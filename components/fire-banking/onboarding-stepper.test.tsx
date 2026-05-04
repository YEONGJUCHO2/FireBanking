import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingStepper } from "./onboarding-stepper";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

describe("OnboardingStepper", () => {
  beforeEach(() => {
    mocks.push.mockReset();
  });

  it("starts with monthly total spending before asking for a FIRE spending goal", () => {
    render(<OnboardingStepper initial={{ totalExpense: 400 }} />);

    expect(screen.getByText(/한 달 총지출은/)).toBeInTheDocument();
    expect(screen.getByText("고정비 시뮬레이터로 더 정확히 보기")).toBeInTheDocument();
    expect(screen.queryByText("현재 생활비 기준으로 시작")).not.toBeInTheDocument();
    expect(screen.queryByText(/현재 생활비 기준/)).not.toBeInTheDocument();
    expect(screen.queryByText(/은퇴 후 매달/)).not.toBeInTheDocument();
    expect(screen.queryByText(/거주 부동산/)).not.toBeInTheDocument();
    expect(screen.queryByText(/기타 자산/)).not.toBeInTheDocument();
  });

  it("returns to onboarding after opening the fixed cost simulator from onboarding", () => {
    render(<OnboardingStepper initial={{ totalExpense: 400 }} />);

    fireEvent.click(screen.getByRole("button", { name: /고정비 시뮬레이터로 더 정확히 보기/ }));

    expect(mocks.push).toHaveBeenCalledWith("/subscribe?returnTo=/onboarding");
  });

  it("uses the same fixed cost simulator card on the first household spending step", () => {
    render(<OnboardingStepper initial={{ totalExpense: 400 }} />);

    expect(screen.getByRole("button", { name: /고정비 시뮬레이터로 더 정확히 보기/ })).toBeInTheDocument();
    expect(screen.getByText("반복 지출을 쪼개서 목표 월 생활비를 잡아요")).toBeInTheDocument();
  });

  it("pre-fills the FIRE spending goal with a buffer from monthly total spending and still allows manual editing", () => {
    render(<OnboardingStepper initial={{ totalExpense: 400 }} />);

    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByText(/은퇴 후 생활비 기준은/)).toBeInTheDocument();
    expect(screen.getByText("월 총지출 400만원에 10% 버퍼를 더해 440만원을 먼저 넣어뒀어요.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("440")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /고정비 시뮬레이터로 더 정확히 보기/ })).not.toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("440"), { target: { value: "320" } });

    expect(screen.getByDisplayValue("320")).toBeInTheDocument();
  });

  it("collects only the four closed-beta onboarding numbers before the result summary", () => {
    render(<OnboardingStepper initial={{ goalExpense: 300, income: 720, totalExpense: 400, investable: 12000 }} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("/ 5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));

    expect(screen.getByRole("heading", { name: /확인하고\s*결과를 함께 볼까요/ })).toBeInTheDocument();
    expect(screen.getAllByText("월 총지출").length).toBeGreaterThan(0);
    expect(screen.getByText("은퇴 후 월 생활비")).toBeInTheDocument();
    expect(screen.queryByText("내 월 고정비")).not.toBeInTheDocument();
    expect(screen.queryByText("내 월 변동비")).not.toBeInTheDocument();
    expect(screen.queryByText("내 월 저축·투자")).not.toBeInTheDocument();
  });

  it("shows the first FIRE result bridge before allowing dashboard entry", () => {
    render(<OnboardingStepper initial={{ goalExpense: 300, income: 720, totalExpense: 400, investable: 12000 }} />);

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "결과 보기" }));

    expect(screen.getByText("첫 FIRE 결과")).toBeInTheDocument();
    expect(screen.getByText("월 300만원으로 살려면 FIRE 기준은 9억원이에요.")).toBeInTheDocument();
    expect(screen.getByText("현재 투자가능 순자산 기준으로는 7억 8,000만원 남았습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "배우자에게 3개 숫자 부탁하기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "대시보드 먼저 보기" })).toBeInTheDocument();
  });

  it("opens the native share sheet when asking a spouse for three numbers", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share,
    });

    render(<OnboardingStepper initial={{ goalExpense: 300, income: 720, totalExpense: 400, investable: 12000 }} />);

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "결과 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "배우자에게 3개 숫자 부탁하기" }));

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("3개 숫자"),
      }),
    );
  });

  it("shows copy feedback when the native share sheet is unavailable", async () => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(<OnboardingStepper initial={{ goalExpense: 300, income: 720, totalExpense: 400, investable: 12000 }} />);

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "결과 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "배우자에게 3개 숫자 부탁하기" }));

    expect(await screen.findByText("공유창을 열 수 없어 요청 문구를 복사했어요.")).toBeInTheDocument();
  });

  it("falls back to copied text when the native share sheet fails", async () => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error("share failed")),
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(<OnboardingStepper initial={{ goalExpense: 300, income: 720, totalExpense: 400, investable: 12000 }} />);

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    fireEvent.click(screen.getByRole("button", { name: "결과 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "배우자에게 3개 숫자 부탁하기" }));

    expect(await screen.findByText("공유창을 열 수 없어 요청 문구를 복사했어요.")).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("3개 숫자"));
  });
});
