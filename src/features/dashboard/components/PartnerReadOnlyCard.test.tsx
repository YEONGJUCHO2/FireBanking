import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PartnerReadOnlyCard } from "./PartnerReadOnlyCard";

describe("PartnerReadOnlyCard", () => {
  it("explains spouse access as read-only", () => {
    render(<PartnerReadOnlyCard />);

    expect(screen.getByText("배우자로 연결됨")).toBeInTheDocument();
    expect(screen.getByText(/읽기 전용으로 확인/)).toBeInTheDocument();
    expect(screen.getByText(/값 수정은 초대한 계정/)).toBeInTheDocument();
  });
});
