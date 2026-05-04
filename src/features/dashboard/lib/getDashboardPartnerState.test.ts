import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDashboardPartnerState } from "./getDashboardPartnerState";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/src/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

function membershipBuilder(data: { couple_id: string } | null) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data, error: null })),
  };
  return builder;
}

function inviteBuilder(data: { token: string } | null) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data, error: null })),
  };
  return builder;
}

function partnerMembersBuilder(data: Array<{ user_id: string }>) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
  };
  builder.eq.mockReturnValueOnce(builder).mockResolvedValueOnce({ data, error: null });
  return builder;
}

function snapshotsBuilder(data: Array<{ created_by: string }>) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(async () => ({ data, error: null })),
  };
  return builder;
}

describe("getDashboardPartnerState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-25T12:00:00.000Z"));
    mocks.createSupabaseServerClient.mockReset();
  });

  it("returns no workspace when the user has not created a couple", async () => {
    const supabase = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
      from: vi.fn(() => membershipBuilder(null)),
    };
    mocks.createSupabaseServerClient.mockResolvedValue(supabase);

    await expect(getDashboardPartnerState()).resolves.toEqual({ state: "no_workspace" });
  });

  it("keeps the partner card pending when there is no connected spouse", async () => {
    const builders = [
      membershipBuilder({ couple_id: "couple-1" }),
      partnerMembersBuilder([]),
      inviteBuilder({ token: "token-1" }),
    ];
    const supabase = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
      from: vi.fn(() => builders.shift()),
    };
    mocks.createSupabaseServerClient.mockResolvedValue(supabase);

    await expect(getDashboardPartnerState()).resolves.toEqual({
      state: "needs_invite",
      coupleId: "couple-1",
      connectedPartnerCount: 0,
      latestInviteUrl: "/invite/token-1",
    });
  });

  it("marks the partner card complete only after a connected spouse has a current snapshot", async () => {
    const builders = [
      membershipBuilder({ couple_id: "couple-1" }),
      partnerMembersBuilder([{ user_id: "lite-1" }]),
      inviteBuilder(null),
      snapshotsBuilder([{ created_by: "lite-1" }]),
    ];
    const supabase = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
      from: vi.fn(() => builders.shift()),
    };
    mocks.createSupabaseServerClient.mockResolvedValue(supabase);

    await expect(getDashboardPartnerState()).resolves.toEqual({
      state: "complete",
      coupleId: "couple-1",
      connectedPartnerCount: 1,
    });
  });
});
