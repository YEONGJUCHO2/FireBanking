import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SettingsPage from "./page";

vi.mock("@/src/features/auth/lib/getCurrentUser", () => ({
  getCurrentUser: vi.fn(async () => null),
}));

describe("SettingsPage", () => {
  it("shows only working settings and avoids demo profile names", async () => {
    render(await SettingsPage());

    expect(screen.getByRole("heading", { name: "설정" })).toBeInTheDocument();
    expect(screen.getByText("미연결")).toBeInTheDocument();
    expect(screen.queryByText("로그아웃")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("지윤");
    expect(document.body).not.toHaveTextContent("민호");
    expect(screen.queryByText("데이터 내보내기")).not.toBeInTheDocument();
  });
});
