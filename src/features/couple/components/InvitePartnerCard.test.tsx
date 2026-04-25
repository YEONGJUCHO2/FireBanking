import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InvitePartnerCard } from "./InvitePartnerCard";

vi.mock("@/src/features/couple/actions/createInviteLink", () => ({
  createInviteLink: vi.fn(),
}));

describe("InvitePartnerCard", () => {
  it("copies an absolute shareable invite URL", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<InvitePartnerCard coupleId="couple-1" latestInviteUrl="/invite/token-1" />);

    fireEvent.click(screen.getByRole("button", { name: "초대 링크 복사" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/invite/token-1`);
    });
    expect(screen.getByRole("button", { name: "복사했어요" })).toBeInTheDocument();
  });
});
