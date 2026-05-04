import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SettingsPage from "./page";

describe("SettingsPage", () => {
  it("shows only working settings and avoids demo profile names", () => {
    render(<SettingsPage />);

    expect(screen.getByRole("heading", { name: "설정" })).toBeInTheDocument();
    expect(screen.getByText("로그아웃")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("지윤");
    expect(document.body).not.toHaveTextContent("민호");
    expect(screen.queryByText("데이터 내보내기")).not.toBeInTheDocument();
  });
});
