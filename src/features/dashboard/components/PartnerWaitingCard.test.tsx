import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PartnerWaitingCard } from "./PartnerWaitingCard";

describe("PartnerWaitingCard", () => {
  it("keeps spouse users on the dashboard while the owner has not shared a result yet", () => {
    render(<PartnerWaitingCard />);

    expect(screen.getByText("아직 공유된 FIRE 결과가 없어요")).toBeInTheDocument();
    expect(screen.getByText(/초대한 계정에서 이번 달 값을 저장하면/)).toBeInTheDocument();
  });
});
