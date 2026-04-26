import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the reference-style login entry screen", () => {
    render(<HomePage />);

    expect(screen.getByText("Fire Banking")).toBeInTheDocument();
    expect(screen.getAllByText(/부부가 함께/).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "시작하기" })).toHaveAttribute(
      "href",
      "/onboarding",
    );
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/dashboard");
    expect(screen.queryByText(/다음 릴리즈/)).not.toBeInTheDocument();
  });
});
