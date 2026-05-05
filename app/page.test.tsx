import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingExperience } from "@/components/fire-banking/landing-experience";

describe("HomePage (LandingExperience)", () => {
  it("renders the landing entry screen", () => {
    render(<LandingExperience />);

    expect(screen.getAllByText("Fire Banking").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/부부가 함께/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/다음 릴리즈/)).not.toBeInTheDocument();
  });
});
