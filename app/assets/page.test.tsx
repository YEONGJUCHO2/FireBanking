import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AssetsPage from "./page";

const mocks = vi.hoisted(() => ({
  getAssetManagementData: vi.fn(),
}));

vi.mock("@/src/features/assets/lib/getAssetManagementData", () => ({
  getAssetManagementData: mocks.getAssetManagementData,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("AssetsPage", () => {
  beforeEach(() => {
    mocks.getAssetManagementData.mockReset();
    mocks.getAssetManagementData.mockResolvedValue({
      coupleId: null,
      holdings: undefined,
      liabilities: undefined,
    });
  });

  it("renders investment and liability management outside the home dashboard", async () => {
    render(await AssetsPage());

    expect(screen.getAllByText("FIRE 자산 진단").length).toBeGreaterThan(0);
    expect(screen.getByText(/투자자산 KPI를 검증해요/)).toBeInTheDocument();
    expect(screen.getAllByText("투자자산").length).toBeGreaterThan(0);
    expect(screen.getAllByText("투자 연동 대출").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "홈으로" })).toHaveAttribute("href", "/dashboard");
  });
});
