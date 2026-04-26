import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminPartnerCard } from "./AdminPartnerCard";

vi.mock("@/src/features/couple/components/InvitePartnerCard", () => ({
  InvitePartnerCard: ({ latestInviteUrl }: { latestInviteUrl?: string }) => (
    <section>
      <h2>배우자에게 공유할 준비</h2>
      {latestInviteUrl ? <p>{latestInviteUrl}</p> : null}
    </section>
  ),
}));

describe("AdminPartnerCard", () => {
  it("shows the invite workflow before a spouse account is connected", () => {
    render(
      <AdminPartnerCard
        coupleId="couple-1"
        connectedPartnerCount={0}
        latestInviteUrl="/invite/token-1"
      />,
    );

    expect(screen.getByText("배우자에게 공유할 준비")).toBeInTheDocument();
    expect(screen.getByText("/invite/token-1")).toBeInTheDocument();
    expect(screen.queryByText("배우자 연결됨")).not.toBeInTheDocument();
  });

  it("shows a connected-state card after a spouse account is connected", () => {
    render(<AdminPartnerCard coupleId="couple-1" connectedPartnerCount={1} />);

    expect(screen.getByText("배우자 연결됨")).toBeInTheDocument();
    expect(screen.getByText(/읽기 전용으로 같은 FIRE 결과/)).toBeInTheDocument();
    expect(screen.queryByText("배우자에게 공유할 준비")).not.toBeInTheDocument();
  });
});
