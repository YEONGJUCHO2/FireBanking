import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HistoryPage from "./page";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  getAssetManagementData: vi.fn(),
}));

vi.mock("@/src/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

vi.mock("@/src/features/assets/lib/getAssetManagementData", () => ({
  getAssetManagementData: mocks.getAssetManagementData,
}));

describe("HistoryPage", () => {
  beforeEach(() => {
    vi.useRealTimers();
    mocks.createSupabaseServerClient.mockReset();
    mocks.getAssetManagementData.mockReset();
    mocks.getAssetManagementData.mockResolvedValue({
      coupleId: null,
      holdings: undefined,
      liabilities: undefined,
    });
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: null } })),
      },
    });
  });

  it("shows the header and explicit empty state when no history data exists", async () => {
    render(await HistoryPage());

    // Header always visible
    expect(screen.getByRole("heading", { name: "월별 체크인 기록" })).toBeInTheDocument();

    expect(screen.getByText("아직 저장된 기록이 없어요")).toBeInTheDocument();
    expect(screen.getByText(/매달 체크인이 마감되면/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "홈에서 현재 결과 보기" })).toHaveAttribute(
      "href",
      "/dashboard",
    );

    expect(screen.queryByText("2026년 5월")).not.toBeInTheDocument();
    expect(screen.queryByText("FIRE까지 남은 금액")).not.toBeInTheDocument();
    expect(screen.queryByText("7억 6,500만원")).not.toBeInTheDocument();
    expect(screen.queryByText("↓ 320만원")).not.toBeInTheDocument();
  });

  it("renders monthly check-in cards with the requested FIRE summary layout", async () => {
    const membershipQuery = createQueryResult({ couple_id: "couple-1" });
    const snapshotQuery = createQueryResult([
      {
        id: "snapshot-2026-05",
        month: "2026-05-01",
        fire_calculation_net_worth: 120_000_000,
        monthly_asset_growth_capacity: 2_800_000,
        annual_fire_expense: 36_000_000,
        fire_target_asset: 900_000_000,
        projected_fire_date: "2040-02-01",
      },
    ]);
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })),
      },
      from: vi.fn((table: string) => {
        if (table === "couple_members") return membershipQuery;
        if (table === "monthly_cashflow_snapshots") return snapshotQuery;
        throw new Error(`Unexpected table: ${table}`);
      }),
    });

    render(await HistoryPage());

    expect(screen.getByRole("heading", { name: "2026년 5월" })).toBeInTheDocument();
    expect(screen.getByText("FIRE까지 남은 금액")).toBeInTheDocument();
    expect(screen.getByText("7억 8,000만원")).toBeInTheDocument();
    expect(screen.getByText("월 체크인 저장 기준")).toBeInTheDocument();
    expect(screen.getByText("상세 정보 보기")).toBeInTheDocument();
    expect(screen.getByText("목표 월 생활비 300만원 · FIRE 목표자산 9억원 기준")).toBeInTheDocument();
    expect(screen.getByText("목표 금액")).toBeInTheDocument();
    expect(screen.getByText("90,000")).toBeInTheDocument();
    expect(screen.getByText("FIRE 후 생활비")).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument();
    expect(screen.getByText("FIRE 계산 순자산")).toBeInTheDocument();
    expect(screen.getByText("12,000")).toBeInTheDocument();
    expect(screen.getByText("모이는 돈")).toBeInTheDocument();
    expect(screen.getByText("280")).toBeInTheDocument();
  });

  it("adds missing monthly check-in cards through the current KST month from the May 2026 baseline", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-02T03:00:00.000Z"));

    const membershipQuery = createQueryResult({ couple_id: "couple-1" });
    const snapshotQuery = createQueryResult([
      {
        id: "snapshot-2026-04",
        month: "2026-04-01",
        fire_calculation_net_worth: 120_000_000,
        monthly_asset_growth_capacity: 2_800_000,
        annual_fire_expense: 36_000_000,
        fire_target_asset: 900_000_000,
        projected_fire_date: "2040-02-01",
      },
    ]);
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })),
      },
      from: vi.fn((table: string) => {
        if (table === "couple_members") return membershipQuery;
        if (table === "monthly_cashflow_snapshots") return snapshotQuery;
        throw new Error(`Unexpected table: ${table}`);
      }),
    });

    render(await HistoryPage());

    const monthHeadings = screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    expect(monthHeadings).toEqual(["2026년 6월", "2026년 5월"]);
    expect(screen.queryByRole("heading", { name: "2026년 4월", level: 2 })).not.toBeInTheDocument();
  });

  it("does not duplicate the current month when a stored snapshot already exists", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-07T12:00:00.000Z"));

    const membershipQuery = createQueryResult({ couple_id: "couple-1" });
    const snapshotQuery = createQueryResult([
      {
        id: "snapshot-2026-05",
        month: "2026-05-01",
        fire_calculation_net_worth: 120_000_000,
        monthly_asset_growth_capacity: 2_800_000,
        annual_fire_expense: 36_000_000,
        fire_target_asset: 900_000_000,
        projected_fire_date: "2040-02-01",
      },
    ]);
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })),
      },
      from: vi.fn((table: string) => {
        if (table === "couple_members") return membershipQuery;
        if (table === "monthly_cashflow_snapshots") return snapshotQuery;
        throw new Error(`Unexpected table: ${table}`);
      }),
    });

    render(await HistoryPage());

    expect(screen.getAllByRole("heading", { name: "2026년 5월", level: 2 })).toHaveLength(1);
  });

  it("uses current asset management FIRE net worth for the visible history card", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-08T03:00:00.000Z"));

    mocks.getAssetManagementData.mockResolvedValue({
      coupleId: "couple-1",
      holdings: [{ valuationAmount: 135_000_000, accountCategory: "general" }],
      liabilities: [],
    });
    const membershipQuery = createQueryResult({ couple_id: "couple-1" });
    const snapshotQuery = createQueryResult([
      {
        id: "snapshot-2026-05",
        month: "2026-05-01",
        fire_calculation_net_worth: 12_000_000,
        monthly_asset_growth_capacity: 2_800_000,
        annual_fire_expense: 36_000_000,
        fire_target_asset: 900_000_000,
        projected_fire_date: "2040-02-01",
      },
    ]);
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })),
      },
      from: vi.fn((table: string) => {
        if (table === "couple_members") return membershipQuery;
        if (table === "monthly_cashflow_snapshots") return snapshotQuery;
        throw new Error(`Unexpected table: ${table}`);
      }),
    });

    render(await HistoryPage());

    expect(screen.getByText("7억 6,500만원")).toBeInTheDocument();
    expect(screen.getByText("13,500")).toBeInTheDocument();
    expect(screen.getByText("현재 자산진단 기준")).toBeInTheDocument();
    expect(screen.queryByText("8억 8,800만원")).not.toBeInTheDocument();
  });

  it("keeps past stored history months on their original snapshot net worth", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-08T03:00:00.000Z"));

    mocks.getAssetManagementData.mockResolvedValue({
      coupleId: "couple-1",
      holdings: [{ valuationAmount: 135_000_000, accountCategory: "general" }],
      liabilities: [],
    });
    const membershipQuery = createQueryResult({ couple_id: "couple-1" });
    const snapshotQuery = createQueryResult([
      {
        id: "snapshot-2026-06",
        month: "2026-06-01",
        fire_calculation_net_worth: 12_000_000,
        monthly_asset_growth_capacity: 2_800_000,
        annual_fire_expense: 36_000_000,
        fire_target_asset: 900_000_000,
        projected_fire_date: "2040-02-01",
      },
      {
        id: "snapshot-2026-05",
        month: "2026-05-01",
        fire_calculation_net_worth: 120_000_000,
        monthly_asset_growth_capacity: 2_800_000,
        annual_fire_expense: 36_000_000,
        fire_target_asset: 900_000_000,
        projected_fire_date: "2040-02-01",
      },
    ]);
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })),
      },
      from: vi.fn((table: string) => {
        if (table === "couple_members") return membershipQuery;
        if (table === "monthly_cashflow_snapshots") return snapshotQuery;
        throw new Error(`Unexpected table: ${table}`);
      }),
    });

    render(await HistoryPage());

    expect(screen.getByText("13,500")).toBeInTheDocument();
    expect(screen.getByText("12,000")).toBeInTheDocument();
    expect(screen.getByText("7억 6,500만원")).toBeInTheDocument();
    expect(screen.getByText("7억 8,000만원")).toBeInTheDocument();
  });
});

function createQueryResult<T>(data: T, error: unknown = null) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data, error })),
    then(resolve: (value: { data: T; error: unknown }) => void) {
      return Promise.resolve({ data, error }).then(resolve);
    },
  };
  return builder;
}
