import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInviteLink } from "./createInviteLink";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  createInviteToken: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/src/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

vi.mock("@/src/features/couple/lib/inviteToken", () => ({
  createInviteToken: mocks.createInviteToken,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

function createFormData(coupleId?: string) {
  const formData = new FormData();

  if (coupleId !== undefined) {
    formData.set("coupleId", coupleId);
  }

  return formData;
}

function createSupabaseMock({
  user = { id: "user-1" },
  insertError = null,
  connectedPartnerCount = 0,
}: {
  user?: { id: string } | null;
  insertError?: unknown;
  connectedPartnerCount?: number | null;
} = {}) {
  const insert = vi.fn(async () => ({ error: insertError }));
  const selectMembers = vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(async () => ({ count: connectedPartnerCount, error: null })),
    })),
  }));
  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user } })),
    },
    from: vi.fn((table: string) => {
      if (table === "couple_members") {
        return { select: selectMembers };
      }

      if (table !== "couple_invites") {
        throw new Error(`Unexpected table: ${table}`);
      }

      return { insert };
    }),
  };

  return { supabase, insert, selectMembers };
}

describe("createInviteLink", () => {
  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset();
    mocks.createInviteToken.mockReset();
    mocks.revalidatePath.mockClear();
  });

  it("returns an error when coupleId is missing", async () => {
    const result = await createInviteLink({}, createFormData());

    expect(result).toEqual({ error: "워크스페이스 정보를 찾지 못했습니다." });
    expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("returns a login error when there is no authenticated user", async () => {
    const refs = createSupabaseMock({ user: null });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await createInviteLink({}, createFormData("couple-1"));

    expect(result).toEqual({ error: "로그인이 필요합니다." });
    expect(refs.insert).not.toHaveBeenCalled();
  });

  it("inserts one invite and returns its preview URL for a valid lead-partner request", async () => {
    const refs = createSupabaseMock();
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);
    mocks.createInviteToken.mockReturnValue("token-1");

    const result = await createInviteLink({}, createFormData("couple-1"));

    expect(refs.insert).toHaveBeenCalledWith({
      couple_id: "couple-1",
      created_by: "user-1",
      token: "token-1",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(result).toEqual({ inviteUrl: "/invite/token-1" });
  });

  it("blocks new invites when a spouse account is already connected", async () => {
    const refs = createSupabaseMock({ connectedPartnerCount: 1 });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);
    mocks.createInviteToken.mockReturnValue("token-1");

    const result = await createInviteLink({}, createFormData("couple-1"));

    expect(result).toEqual({
      error: "이미 배우자 계정이 연결되어 있습니다. 연동 해제 후 다시 초대해주세요.",
    });
    expect(refs.insert).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("returns an invite creation error when insert fails", async () => {
    const refs = createSupabaseMock({ insertError: new Error("insert failed") });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);
    mocks.createInviteToken.mockReturnValue("token-1");

    const result = await createInviteLink({}, createFormData("couple-1"));

    expect(result).toEqual({ error: "초대 링크를 만들지 못했습니다." });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
