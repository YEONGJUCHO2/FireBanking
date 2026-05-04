import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TogetherPage from "./page";

const mocks = vi.hoisted(() => ({
  getDashboardPartnerState: vi.fn(),
}));

vi.mock("@/src/features/dashboard/lib/getDashboardPartnerState", () => ({
  getDashboardPartnerState: mocks.getDashboardPartnerState,
}));

vi.mock("@/src/features/dashboard/components/AdminPartnerCard", () => ({
  AdminPartnerCard: ({ latestInviteUrl }: { latestInviteUrl?: string }) => (
    <section>
      <h2>배우자에게 공유할 준비</h2>
      {latestInviteUrl ? <p>{latestInviteUrl}</p> : null}
    </section>
  ),
}));

describe("TogetherPage", () => {
  beforeEach(() => {
    mocks.getDashboardPartnerState.mockReset();
    mocks.getDashboardPartnerState.mockResolvedValue({
      state: "needs_invite",
      coupleId: "couple-1",
      connectedPartnerCount: 0,
      latestInviteUrl: "/invite/token-1",
    });
  });

  it("uses relationship labels instead of hard-coded demo names", async () => {
    render(await TogetherPage());

    expect(screen.getByRole("heading", { name: "우리 가족" })).toBeInTheDocument();
    expect(screen.getAllByText("나").length).toBeGreaterThan(0);
    expect(screen.getByText("배우자")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "분석" })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("관리자");
    expect(document.body).not.toHaveTextContent("Lite");
    expect(document.body).not.toHaveTextContent("2026년 5월 1일");
    expect(document.body).not.toHaveTextContent("지윤");
    expect(document.body).not.toHaveTextContent("민호");
  });

  it("shows the spouse invite workflow when no spouse account is connected", async () => {
    render(await TogetherPage());

    expect(screen.getByText("배우자 초대")).toBeInTheDocument();
    expect(screen.getByText("배우자에게 공유할 준비")).toBeInTheDocument();
    expect(screen.getByText("/invite/token-1")).toBeInTheDocument();
  });

  it("does not show the invite workflow when no workspace exists", async () => {
    mocks.getDashboardPartnerState.mockResolvedValue({ state: "no_workspace" });

    render(await TogetherPage());

    expect(screen.queryByText("배우자 초대")).not.toBeInTheDocument();
    expect(screen.queryByText("배우자에게 공유할 준비")).not.toBeInTheDocument();
  });
});
