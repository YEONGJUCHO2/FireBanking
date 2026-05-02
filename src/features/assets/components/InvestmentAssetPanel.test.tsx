import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InvestmentAssetPanel } from "./InvestmentAssetPanel";

const mocks = vi.hoisted(() => ({
  searchDomesticInstruments: vi.fn(),
  saveHolding: vi.fn(),
  saveKnownDomesticHolding: vi.fn(),
  updateHolding: vi.fn(),
  deleteHolding: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock("@/src/features/assets/actions/searchDomesticInstruments", () => ({
  searchDomesticInstruments: mocks.searchDomesticInstruments,
}));

vi.mock("@/src/features/assets/actions/saveHolding", () => ({
  saveHolding: mocks.saveHolding,
}));

vi.mock("@/src/features/assets/actions/saveKnownDomesticHolding", () => ({
  saveKnownDomesticHolding: mocks.saveKnownDomesticHolding,
}));

vi.mock("@/src/features/assets/actions/updateHolding", () => ({
  updateHolding: mocks.updateHolding,
}));

vi.mock("@/src/features/assets/actions/deleteHolding", () => ({
  deleteHolding: mocks.deleteHolding,
}));

describe("InvestmentAssetPanel", () => {
  beforeEach(() => {
    mocks.searchDomesticInstruments.mockReset();
    mocks.searchDomesticInstruments.mockImplementation(() => new Promise(() => {}));
    mocks.saveHolding.mockReset();
    mocks.saveKnownDomesticHolding.mockReset();
    mocks.updateHolding.mockReset();
    mocks.deleteHolding.mockReset();
    mocks.refresh.mockReset();
  });

  it("shows domestic search and manual US-listed calculation", () => {
    render(<InvestmentAssetPanel />);

    expect(screen.getByText("투자자산")).toBeInTheDocument();
    expect(screen.getByText("종목 검색")).toBeInTheDocument();
    expect(screen.queryByText("VOO")).not.toBeInTheDocument();
    expect(screen.getByText("미국상장 수동 계산")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수량 수정" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  it("shows an empty holding state", () => {
    render(<InvestmentAssetPanel holdings={[]} />);

    expect(screen.getByText("아직 등록한 종목이 없어요.")).toBeInTheDocument();
    expect(screen.queryByText("TIGER 미국S&P500")).not.toBeInTheDocument();
  });

  it("lets a user search, add, edit quantity, and delete holdings in the alpha panel", () => {
    render(<InvestmentAssetPanel holdings={[]} />);

    fireEvent.change(screen.getByLabelText("종목 검색어"), { target: { value: "삼성" } });
    fireEvent.click(screen.getByRole("button", { name: "검색" }));
    fireEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(screen.getAllByText("삼성전자").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "수량 수정" }));
    fireEvent.change(screen.getByLabelText("삼성전자 보유 수량"), { target: { value: "25" } });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(screen.getByText(/25주/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "삭제" }));

    expect(screen.queryByText(/25주/)).not.toBeInTheDocument();
    expect(screen.getByText("아직 등록한 종목이 없어요.")).toBeInTheDocument();
  });

  it("lets a user search by pressing Enter", () => {
    render(<InvestmentAssetPanel holdings={[]} />);

    fireEvent.change(screen.getByLabelText("종목 검색어"), { target: { value: "379810" } });
    fireEvent.keyDown(screen.getByLabelText("종목 검색어"), { key: "Enter" });

    expect(screen.getByText("KODEX 미국나스닥100")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "추가" })).toBeInTheDocument();
  });

  it("shows Korean individual stocks such as POSCO Future M and POSCO Holdings", () => {
    render(<InvestmentAssetPanel holdings={[]} />);

    fireEvent.change(screen.getByLabelText("종목 검색어"), { target: { value: "포스코" } });
    fireEvent.click(screen.getByRole("button", { name: "검색" }));

    expect(screen.getByText("포스코퓨처엠")).toBeInTheDocument();
    expect(screen.getByText(/003670/)).toBeInTheDocument();
    expect(screen.getByText("포스코홀딩스")).toBeInTheDocument();
    expect(screen.getByText(/005490/)).toBeInTheDocument();
  });

  it("uses live domestic instrument search and saves selected instrument ids for a couple", async () => {
    mocks.searchDomesticInstruments.mockResolvedValue({
      instruments: [
        {
          id: "instrument-posco",
          market: "KR",
          symbol: "003670",
          displayName: "포스코퓨처엠",
          instrumentType: "stock",
          currency: "KRW",
          lastClosePrice: 261_000,
        },
      ],
    });
    mocks.saveHolding.mockResolvedValue({ success: true });
    render(<InvestmentAssetPanel coupleId="couple-1" holdings={[]} />);

    fireEvent.change(screen.getByLabelText("종목 검색어"), { target: { value: "포스코" } });
    fireEvent.click(screen.getByRole("button", { name: "검색" }));

    await waitFor(() => {
      expect(screen.getByText("포스코퓨처엠")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "추가" }));

    await waitFor(() => {
      expect(mocks.saveHolding).toHaveBeenCalled();
    });
    const submitted = mocks.saveHolding.mock.calls[0][1] as FormData;
    expect(submitted.get("coupleId")).toBe("couple-1");
    expect(submitted.get("instrumentId")).toBe("instrument-posco");
    expect(submitted.get("quantity")).toBe("1");
  });

  it("uses live domestic instrument search even before a couple exists", async () => {
    mocks.searchDomesticInstruments.mockResolvedValue({
      instruments: [
        {
          id: "search-086520",
          market: "KR",
          symbol: "086520",
          displayName: "에코프로",
          instrumentType: "stock",
          currency: "KRW",
          lastClosePrice: 159_900,
        },
      ],
    });
    render(<InvestmentAssetPanel holdings={[]} />);

    fireEvent.change(screen.getByLabelText("종목 검색어"), { target: { value: "에코프로" } });
    fireEvent.click(screen.getByRole("button", { name: "검색" }));

    await waitFor(() => {
      expect(screen.getByText("에코프로")).toBeInTheDocument();
    });
    expect(mocks.searchDomesticInstruments).toHaveBeenCalled();
  });

  it("autocompletes live search results and pages them three at a time", async () => {
    mocks.searchDomesticInstruments.mockResolvedValue({
      instruments: [
        {
          id: "instrument-posco-future",
          market: "KR",
          symbol: "003670",
          displayName: "포스코퓨처엠",
          instrumentType: "stock",
          currency: "KRW",
          lastClosePrice: 261_000,
        },
        {
          id: "instrument-posco-holdings",
          market: "KR",
          symbol: "005490",
          displayName: "POSCO홀딩스",
          instrumentType: "stock",
          currency: "KRW",
          lastClosePrice: 469_000,
        },
        {
          id: "instrument-posco-dx",
          market: "KR",
          symbol: "022100",
          displayName: "포스코DX",
          instrumentType: "stock",
          currency: "KRW",
          lastClosePrice: 36_350,
        },
        {
          id: "instrument-posco-intl",
          market: "KR",
          symbol: "047050",
          displayName: "포스코인터내셔널",
          instrumentType: "stock",
          currency: "KRW",
          lastClosePrice: 84_900,
        },
      ],
    });
    render(<InvestmentAssetPanel coupleId="couple-1" holdings={[]} />);

    fireEvent.change(screen.getByLabelText("종목 검색어"), { target: { value: "포스코" } });

    await waitFor(() => {
      expect(screen.getByText("포스코퓨처엠")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("POSCO홀딩스")).toBeInTheDocument();
      expect(screen.getByText("포스코DX")).toBeInTheDocument();
    });
    expect(screen.queryByText("포스코인터내셔널")).not.toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "추가" })).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "다음 검색 결과" }));

    expect(screen.getByText("포스코인터내셔널")).toBeInTheDocument();
    expect(screen.queryByText("포스코퓨처엠")).not.toBeInTheDocument();
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });

  it("renders autocomplete results in a slot directly below the search input", async () => {
    mocks.searchDomesticInstruments.mockResolvedValue({
      instruments: [
        {
          id: "instrument-posco-future",
          market: "KR",
          symbol: "003670",
          displayName: "포스코퓨처엠",
          instrumentType: "stock",
          currency: "KRW",
          lastClosePrice: 261_000,
        },
      ],
    });
    render(<InvestmentAssetPanel coupleId="couple-1" holdings={[]} />);

    fireEvent.change(screen.getByLabelText("종목 검색어"), { target: { value: "포스코" } });

    await waitFor(() => {
      expect(screen.getByText("포스코퓨처엠")).toBeInTheDocument();
    });
    const autocompleteSlot = screen.getByTestId("instrument-autocomplete-slot");
    const holdingsSection = screen.getByTestId("holdings-section");

    expect(
      autocompleteSlot.compareDocumentPosition(holdingsSection) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows last close prices in autocomplete rows and uses compact add buttons", async () => {
    mocks.searchDomesticInstruments.mockResolvedValue({
      instruments: [
        {
          id: "instrument-posco-future",
          market: "KR",
          symbol: "003670",
          displayName: "포스코퓨처엠",
          instrumentType: "stock",
          currency: "KRW",
          lastClosePrice: 261_000,
        },
      ],
    });
    render(<InvestmentAssetPanel coupleId="couple-1" holdings={[]} />);

    fireEvent.change(screen.getByLabelText("종목 검색어"), { target: { value: "포스코" } });

    const autocompleteSlot = await screen.findByTestId("instrument-autocomplete-slot");

    await waitFor(() => {
      expect(within(autocompleteSlot).getByText(/전일 종가 ₩261,000/)).toBeInTheDocument();
    });
    expect(within(autocompleteSlot).getByRole("button", { name: "추가" })).toBeInTheDocument();
    expect(within(autocompleteSlot).queryByRole("button", { name: "포스코퓨처엠 추가" })).not.toBeInTheDocument();
  });
});
