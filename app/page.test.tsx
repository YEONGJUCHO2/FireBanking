import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the upgraded landing entry screen", () => {
    render(<HomePage />);

    expect(screen.getAllByText("Fire Banking").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/부부가 함께/).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "G-mail로 시작하기" })).toHaveAttribute(
      "href",
      "/onboarding",
    );
    expect(screen.getByRole("link", { name: "카카오로 계속하기" })).toHaveAttribute("href", "/onboarding");
    expect(screen.queryByText(/다음 릴리즈/)).not.toBeInTheDocument();
  });
});
