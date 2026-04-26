import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { R0OnboardingForm } from "./R0OnboardingForm";

vi.mock("@/src/features/onboarding/actions/saveR0Snapshot", () => ({
  saveR0Snapshot: vi.fn(),
}));

describe("R0OnboardingForm", () => {
  it("shows manwon suffixes and formats money inputs with comma separators", () => {
    render(<R0OnboardingForm />);

    expect(screen.getAllByText("만원")).toHaveLength(7);

    const investableNetWorth = screen.getByRole("textbox", { name: "투자가능 순자산" });
    fireEvent.change(investableNetWorth, { target: { value: "12000" } });

    expect(investableNetWorth).toHaveValue("12,000");
  });
});
