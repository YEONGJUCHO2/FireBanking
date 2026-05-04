import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOnboardingAccessState } from "./onboardingAccessState";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/src/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

function membershipBuilder(data: { couple_id: string; role: string } | null) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data, error: null })),
  };
  return builder;
}

function snapshotBuilder(data: { month: string } | null) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(async () => ({ data, error: null })),
  };
  return builder;
}

describe("getOnboardingAccessState", () => {
  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset();
  });

  it("allows onboarding for a new signed-in user without workspace data", async () => {
    const supabase = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
      from: vi.fn(() => membershipBuilder(null)),
    };
    mocks.createSupabaseServerClient.mockResolvedValue(supabase);

    await expect(getOnboardingAccessState()).resolves.toEqual({ canStartOnboarding: true });
  });

  it("redirects existing users who already have a workspace snapshot", async () => {
    const builders = [
      membershipBuilder({ couple_id: "couple-1", role: "admin" }),
      snapshotBuilder({ month: "2026-05-01" }),
    ];
    const supabase = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
      from: vi.fn(() => builders.shift()),
    };
    mocks.createSupabaseServerClient.mockResolvedValue(supabase);

    await expect(getOnboardingAccessState()).resolves.toEqual({ canStartOnboarding: false });
  });

  it("redirects spouse accounts away from owner onboarding", async () => {
    const supabase = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "lite-1" } } })) },
      from: vi.fn(() => membershipBuilder({ couple_id: "couple-1", role: "lite" })),
    };
    mocks.createSupabaseServerClient.mockResolvedValue(supabase);

    await expect(getOnboardingAccessState()).resolves.toEqual({ canStartOnboarding: false });
  });

  it("redirects existing owner workspaces even before another onboarding snapshot is present", async () => {
    const builders = [
      membershipBuilder({ couple_id: "couple-1", role: "admin" }),
      snapshotBuilder(null),
    ];
    const supabase = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } } })) },
      from: vi.fn(() => builders.shift()),
    };
    mocks.createSupabaseServerClient.mockResolvedValue(supabase);

    await expect(getOnboardingAccessState()).resolves.toEqual({ canStartOnboarding: false });
  });
});
