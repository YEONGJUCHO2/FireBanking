import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LiteOnboarding } from "./lite-onboarding";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("LiteOnboarding", () => {
  it("shows the FIRE spending reference with the same buffer as admin onboarding", () => {
    render(<LiteOnboarding token="invite-token" initial={{ income: 380, recur: 180, save: 60 }} />);

    expect(screen.getByText("FIRE 기준 참고값은 월 198만원이에요.")).toBeInTheDocument();
    expect(screen.getByText("월 반복지출 180만원에 10% 버퍼를 더한 값입니다.")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "내 월 반복지출" }), {
      target: { value: "200" },
    });

    expect(screen.getByText("FIRE 기준 참고값은 월 220만원이에요.")).toBeInTheDocument();
  });

  it("does not prefill demo numbers or stale check-in dates for a first partner check-in", () => {
    render(<LiteOnboarding token="invite-token" />);

    expect(screen.getByLabelText("내 세후 월수입")).toHaveValue("0");
    expect(screen.getByLabelText("내 월 반복지출")).toHaveValue("0");
    expect(screen.getByLabelText("내 월 정기저축 / 투자")).toHaveValue("0");
    expect(document.body).not.toHaveTextContent("2026. 04. 체크인");
    expect(screen.queryByText(/FIRE 기준 참고값은 월 198만원/)).not.toBeInTheDocument();
  });
});
