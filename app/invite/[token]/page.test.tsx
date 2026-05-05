import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import InvitePage from "./page";

describe("InvitePage", () => {
  it("does not present demo names as real invite participants", async () => {
    render(
      await InvitePage({
        params: Promise.resolve({ token: "invite-token" }),
      }),
    );

    expect(screen.getByText("초대가 도착했어요")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "워크스페이스 참여하기" })).toHaveAttribute(
      "href",
      "/invite/invite-token/lite",
    );
    expect(document.body).not.toHaveTextContent("지윤");
    expect(document.body).not.toHaveTextContent("민호");
  });
});
