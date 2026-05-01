import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardMobilePage from "./page";

describe("DashboardMobilePage", () => {
  it("renders the mobile dashboard shell on a dedicated route", () => {
    render(<DashboardMobilePage />);

    expect(screen.getByText("안녕하세요, 지윤님")).toBeInTheDocument();
    expect(screen.getByText("이번 달 부부 체크인")).toBeInTheDocument();
    expect(screen.getByText("고정비 시뮬레이터")).toBeInTheDocument();
  });
});
