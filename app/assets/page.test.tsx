import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AssetsPage from "./page";

describe("AssetsPage", () => {
  it("renders investment and liability management outside the home dashboard", () => {
    render(<AssetsPage />);

    expect(screen.getAllByRole("heading", { name: "자산·부채 관리" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("투자자산").length).toBeGreaterThan(0);
    expect(screen.getAllByText("부채").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "홈으로" })).toHaveAttribute("href", "/dashboard");
  });
});
