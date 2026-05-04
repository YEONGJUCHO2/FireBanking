import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TogetherPage from "./page";

describe("TogetherPage", () => {
  it("uses relationship labels instead of hard-coded demo names", () => {
    render(<TogetherPage />);

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
});
