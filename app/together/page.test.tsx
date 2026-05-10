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
    mocks.getDashboardPartnerState.mockResolvedValue({
      state: "needs_invite",
      coupleId: "couple-1",
      connectedPartnerCount: 0,
    });

    render(await TogetherPage());

    expect(screen.getByText("배우자 초대")).toBeInTheDocument();
    expect(screen.getByText("배우자에게 공유할 준비")).toBeInTheDocument();
  });

  it("does not show the invite workflow when no workspace exists", async () => {
    mocks.getDashboardPartnerState.mockResolvedValue({ state: "no_workspace" });

    render(await TogetherPage());

    expect(screen.queryByText("배우자 초대")).not.toBeInTheDocument();
    expect(screen.queryByText("배우자에게 공유할 준비")).not.toBeInTheDocument();
  });

  it("does not render the separate current check-in status card", async () => {
    render(await TogetherPage());

    expect(screen.queryByText("이번 달 체크인")).not.toBeInTheDocument();
    expect(screen.queryByText("배우자님 입력이 끝나면 결과가 확정돼요")).not.toBeInTheDocument();
  });

  it("does not render the next check-in reminder card", async () => {
    render(await TogetherPage());

    expect(screen.queryByText("다음 체크인")).not.toBeInTheDocument();
    expect(screen.queryByText(/매달 첫째 주에 함께/)).not.toBeInTheDocument();
  });

  it("replaces the invite workflow with an amount input reminder after an invite link exists", async () => {
    render(await TogetherPage());

    expect(screen.queryByText("배우자 초대")).not.toBeInTheDocument();
    expect(screen.queryByText("배우자에게 공유할 준비")).not.toBeInTheDocument();
    expect(screen.getByText("배우자 금액 입력 알림")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "초대 링크 복사" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "카카오톡 공유" })).toBeInTheDocument();
  });

  it("shows the amount input reminder after the spouse accepts but has not checked in", async () => {
    mocks.getDashboardPartnerState.mockResolvedValue({
      state: "waiting_for_input",
      coupleId: "couple-1",
      connectedPartnerCount: 1,
      latestInviteUrl: "/invite/token-1",
    });

    render(await TogetherPage());

    expect(screen.queryByText("배우자에게 공유할 준비")).not.toBeInTheDocument();
    expect(screen.getByText("배우자 금액 입력 알림")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "초대 링크 복사" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "카카오톡 공유" })).toBeInTheDocument();
  });
});
