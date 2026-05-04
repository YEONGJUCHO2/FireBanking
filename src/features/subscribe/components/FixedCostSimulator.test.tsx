import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultFixedCostConfig } from "@/src/features/subscribe/lib/fixedCostDefaults";
import { FixedCostSimulator } from "./FixedCostSimulator";

describe("FixedCostSimulator", () => {
  const noopApply = async () => ({});

  function expandFixedCosts() {
    const fixedCostsButton = screen.queryByRole("button", { name: /고정비.*펼치기/ });
    if (fixedCostsButton) {
      fireEvent.click(fixedCostsButton);
    }
  }

  function expandCategory(name: string) {
    expandFixedCosts();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`${name}.*펼치기`) }));
  }

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it("updates the projection when a fixed cost is toggled", () => {
    render(
      <FixedCostSimulator
        initialConfig={defaultFixedCostConfig}
        saveAction={async () => ({})}
        applyAction={noopApply}
      />,
    );

    expect(screen.getByText("FIRE 생활비 조정기")).toBeInTheDocument();
    expect(screen.getByText("계산된 월 생활비")).toBeInTheDocument();
    expect(screen.queryByText("월 실수령액")).not.toBeInTheDocument();
    expect(screen.queryByText("시뮬레이션 기간")).not.toBeInTheDocument();
    expect(screen.queryByText("투자 비율")).not.toBeInTheDocument();
    expect(screen.queryByText("예상 수익률")).not.toBeInTheDocument();
    expandCategory("디지털 구독");
    fireEvent.click(screen.getByRole("button", { name: "유튜브 프리미엄" }));

    expect(screen.getAllByText(/₩14,900/).length).toBeGreaterThan(0);
  });

  it("keeps fixed cost categories collapsed by default and shows only category totals", () => {
    render(
      <FixedCostSimulator
        initialConfig={defaultFixedCostConfig}
        saveAction={async () => ({})}
        applyAction={noopApply}
      />,
    );

    expandFixedCosts();

    expect(screen.getByRole("button", { name: /디지털 구독.*₩0.*펼치기/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /금융\/보험.*₩0.*펼치기/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "유튜브 프리미엄" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "보험료" })).not.toBeInTheDocument();
  });

  it("keeps the whole fixed cost section collapsed by default", () => {
    render(
      <FixedCostSimulator
        initialConfig={defaultFixedCostConfig}
        saveAction={async () => ({})}
        applyAction={noopApply}
      />,
    );

    expect(screen.getByRole("button", { name: /고정비.*₩0.*펼치기/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /디지털 구독.*₩0.*펼치기/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /금융\/보험.*₩0.*펼치기/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /고정비.*₩0.*펼치기/ }));

    expect(screen.getByRole("button", { name: /고정비.*₩0.*접기/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /디지털 구독.*₩0.*펼치기/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /금융\/보험.*₩0.*펼치기/ })).toBeInTheDocument();
  });

  it("keeps variable expenses collapsed by default and expands them on demand", () => {
    render(
      <FixedCostSimulator
        initialConfig={{
          ...defaultFixedCostConfig,
          livingExpenses: [
            { id: "food", name: "식비", monthlyAmount: 800_000 },
            { id: "transport", name: "교통비", monthlyAmount: 120_000 },
          ],
        }}
        saveAction={async () => ({})}
        applyAction={noopApply}
      />,
    );

    expect(screen.getByRole("button", { name: /변동비.*₩920,000.*펼치기/ })).toBeInTheDocument();
    expect(screen.queryByLabelText("식비 월 금액")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("교통비 월 금액")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /변동비.*₩920,000.*펼치기/ }));

    expect(screen.getByRole("button", { name: /변동비.*₩920,000.*접기/ })).toBeInTheDocument();
    expect(screen.getByLabelText("식비 월 금액")).toHaveValue("800,000");
    expect(screen.getByLabelText("교통비 월 금액")).toHaveValue("120,000");
  });

  it("lets a user add a custom fixed cost item", () => {
    render(
      <FixedCostSimulator
        initialConfig={defaultFixedCostConfig}
        saveAction={async () => ({})}
        applyAction={noopApply}
      />,
    );

    expandCategory("직접 추가");
    fireEvent.change(screen.getByLabelText("직접 추가 항목명"), {
      target: { value: "주차 정기권" },
    });
    fireEvent.change(screen.getByLabelText("직접 추가 월 금액"), {
      target: { value: "90000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(screen.getByRole("button", { name: "주차 정기권" })).toBeInTheDocument();
    expect(screen.getAllByText(/₩90,000/).length).toBeGreaterThan(0);
  });

  it("lets a user add a fixed cost item inside a specific category", () => {
    render(
      <FixedCostSimulator
        initialConfig={defaultFixedCostConfig}
        saveAction={async () => ({})}
        applyAction={noopApply}
      />,
    );

    expandCategory("디지털 구독");
    fireEvent.click(screen.getByRole("button", { name: "디지털 구독 추가" }));
    fireEvent.change(screen.getByLabelText("디지털 구독 새 항목명"), {
      target: { value: "스포티파이" },
    });
    fireEvent.change(screen.getByLabelText("디지털 구독 새 월 금액"), {
      target: { value: "10900" },
    });
    fireEvent.click(screen.getByRole("button", { name: "디지털 구독 항목 저장" }));

    expect(screen.getByRole("button", { name: "스포티파이" })).toBeInTheDocument();
    expect(screen.getAllByText(/₩10,900/).length).toBeGreaterThan(0);
  });

  it("formats card amount inputs with thousands separators and defaults each card unit to won", async () => {
    const saveAction = vi.fn().mockResolvedValue({ saved: true });

    render(
      <FixedCostSimulator
        initialConfig={defaultFixedCostConfig}
        saveAction={saveAction}
        applyAction={noopApply}
      />,
    );

    expect(screen.queryByLabelText("금액 단위")).not.toBeInTheDocument();
    expandCategory("디지털 구독");
    expect(screen.getByLabelText("유튜브 프리미엄 금액 단위")).toHaveValue("won");
    expect(screen.getByLabelText("유튜브 프리미엄 월 금액")).toHaveValue("14,900");

    fireEvent.change(screen.getByLabelText("유튜브 프리미엄 월 금액"), {
      target: { value: "20000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(saveAction).toHaveBeenCalled();
    });
    expect(screen.getByLabelText("유튜브 프리미엄 월 금액")).toHaveValue("20,000");
    expect(saveAction.mock.calls[0][0].subscriptionCategories[0].items[0].monthlyAmount).toBe(20_000);
  });

  it("lets a user choose thousand-won or ten-thousand-won units at each amount input", () => {
    render(
      <FixedCostSimulator
        initialConfig={defaultFixedCostConfig}
        saveAction={async () => ({})}
        applyAction={noopApply}
      />,
    );

    expandCategory("직접 추가");
    fireEvent.change(screen.getByLabelText("직접 추가 금액 단위"), {
      target: { value: "man" },
    });
    fireEvent.change(screen.getByLabelText("직접 추가 항목명"), {
      target: { value: "주차 정기권" },
    });
    fireEvent.change(screen.getByLabelText("직접 추가 월 금액"), {
      target: { value: "9" },
    });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(screen.getAllByText(/₩90,000/).length).toBeGreaterThan(0);
    expect(screen.getByLabelText("주차 정기권 금액 단위")).toHaveValue("man");
    expect(screen.getByLabelText("주차 정기권 월 금액")).toHaveValue("9");

    fireEvent.change(screen.getByLabelText("주차 정기권 금액 단위"), {
      target: { value: "thousand" },
    });

    expect(screen.getByLabelText("주차 정기권 월 금액")).toHaveValue("90");
  });

  it("lets a user delete an existing fixed cost card", () => {
    render(
      <FixedCostSimulator
        initialConfig={defaultFixedCostConfig}
        saveAction={async () => ({})}
        applyAction={noopApply}
      />,
    );

    expandCategory("디지털 구독");
    fireEvent.click(screen.getByRole("button", { name: "유튜브 프리미엄 삭제" }));

    expect(screen.queryByRole("button", { name: "유튜브 프리미엄" })).not.toBeInTheDocument();
  });

  it("lets a user edit a card amount before saving", async () => {
    const saveAction = vi.fn().mockResolvedValue({ saved: true });

    render(
      <FixedCostSimulator
        initialConfig={defaultFixedCostConfig}
        saveAction={saveAction}
        applyAction={noopApply}
      />,
    );

    expandCategory("디지털 구독");
    fireEvent.click(screen.getByRole("button", { name: "유튜브 프리미엄" }));
    expect(screen.queryByText("유튜브 프리미엄 월 금액")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("유튜브 프리미엄 월 금액"), {
      target: { value: "20000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(saveAction).toHaveBeenCalled();
    });
    expect(saveAction.mock.calls[0][0].subscriptionCategories[0].items[0].monthlyAmount).toBe(20_000);
    expect(screen.getAllByText(/₩20,000/).length).toBeGreaterThan(0);
  });

  it("saves locally when the server requires login", async () => {
    const saveAction = vi.fn().mockResolvedValue({ error: "로그인이 필요합니다." });

    render(
      <FixedCostSimulator
        initialConfig={defaultFixedCostConfig}
        saveAction={saveAction}
        applyAction={noopApply}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(screen.getByText("이 브라우저에 저장했어요.")).toBeInTheDocument();
    });
    expect(screen.queryByText("로그인이 필요합니다.")).not.toBeInTheDocument();
    expect(window.localStorage.getItem("fire-living-expense-adjuster-config")).toContain(
      "subscriptionCategories",
    );
  });

  it("opens a note field from the pencil control without showing include text", () => {
    render(
      <FixedCostSimulator
        initialConfig={defaultFixedCostConfig}
        saveAction={async () => ({})}
        applyAction={noopApply}
      />,
    );

    expect(screen.queryByText("포함")).not.toBeInTheDocument();
    expect(screen.queryByText("제외")).not.toBeInTheDocument();

    expandCategory("디지털 구독");
    fireEvent.click(screen.getByRole("button", { name: "유튜브 프리미엄 메모 편집" }));
    fireEvent.change(screen.getByLabelText("유튜브 프리미엄 메모"), {
      target: { value: "가족 계정으로 바꾸기" },
    });

    expect(screen.getByDisplayValue("가족 계정으로 바꾸기")).toBeInTheDocument();
  });

  it("keeps saving separate from applying the recommended value", async () => {
    const saveAction = vi.fn().mockResolvedValue({ saved: true });
    const applyAction = vi.fn().mockResolvedValue({ applied: true });

    render(
      <FixedCostSimulator
        initialConfig={defaultFixedCostConfig}
        saveAction={saveAction}
        applyAction={applyAction}
      />,
    );

    fireEvent.change(screen.getByLabelText("버퍼 금액"), {
      target: { value: "200000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "추천값 적용" }));

    await waitFor(() => {
      expect(applyAction).toHaveBeenCalled();
    });
    expect(saveAction).not.toHaveBeenCalled();
    expect(applyAction.mock.calls[0][0].bufferMonthlyAmount).toBe(200_000);
    expect(screen.getByText("대시보드에 적용했어요.")).toBeInTheDocument();
  });

  it("lets a user set buffer from a preset", () => {
    render(
      <FixedCostSimulator
        initialConfig={{
          ...defaultFixedCostConfig,
          livingExpenses: [{ id: "food", name: "식비", monthlyAmount: 1_000_000 }],
        }}
        saveAction={async () => ({})}
        applyAction={noopApply}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "10%" }));

    expect(screen.getByLabelText("버퍼 금액")).toHaveValue("100,000");
  });

  it("shows copy failure feedback instead of throwing when clipboard is blocked", async () => {
    const writeText = vi.fn().mockRejectedValue(new DOMException("blocked", "NotAllowedError"));
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(
      <FixedCostSimulator
        initialConfig={defaultFixedCostConfig}
        saveAction={async () => ({})}
        applyAction={noopApply}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "결과 공유하기" }));
    fireEvent.click(screen.getByRole("button", { name: "링크 복사" }));

    await waitFor(() => {
      expect(screen.getByText("복사 권한이 막혔어요. 주소창 URL을 직접 복사해주세요.")).toBeInTheDocument();
    });
  });
});
