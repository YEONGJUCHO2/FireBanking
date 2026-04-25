import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { defaultFixedCostConfig } from "@/src/features/subscribe/lib/fixedCostDefaults";
import { FixedCostSimulator } from "./FixedCostSimulator";

describe("FixedCostSimulator", () => {
  it("updates the projection when a fixed cost is toggled", () => {
    render(<FixedCostSimulator initialConfig={defaultFixedCostConfig} saveAction={async () => ({})} />);

    expect(screen.getByText("월 고정비")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "유튜브 프리미엄" }));

    expect(screen.getByText(/₩14,900/)).toBeInTheDocument();
  });

  it("lets a user edit a card amount before saving", async () => {
    const saveAction = vi.fn().mockResolvedValue({ saved: true });

    render(<FixedCostSimulator initialConfig={defaultFixedCostConfig} saveAction={saveAction} />);

    fireEvent.click(screen.getByRole("button", { name: "유튜브 프리미엄" }));
    fireEvent.change(screen.getByLabelText("유튜브 프리미엄 월 금액"), {
      target: { value: "20000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(saveAction).toHaveBeenCalled();
    });
    expect(saveAction.mock.calls[0][0].subscriptionCategories[0].items[0].monthlyAmount).toBe(20_000);
    expect(screen.getByText(/₩20,000/)).toBeInTheDocument();
  });

  it("shows copy failure feedback instead of throwing when clipboard is blocked", async () => {
    const writeText = vi.fn().mockRejectedValue(new DOMException("blocked", "NotAllowedError"));
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(<FixedCostSimulator initialConfig={defaultFixedCostConfig} saveAction={async () => ({})} />);

    fireEvent.click(screen.getByRole("button", { name: "결과 공유하기" }));
    fireEvent.click(screen.getByRole("button", { name: "링크 복사" }));

    await waitFor(() => {
      expect(screen.getByText("복사 권한이 막혔어요. 주소창 URL을 직접 복사해주세요.")).toBeInTheDocument();
    });
  });
});
