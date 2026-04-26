import { beforeEach, describe, expect, it, vi } from "vitest";
import { acceptInvite } from "./acceptInvite";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
  revalidatePath: vi.fn(),
}));

vi.mock("@/src/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

function createFormData(token?: string) {
  const formData = new FormData();

  if (token !== undefined) {
    formData.set("token", token);
  }

  return formData;
}

function createSupabaseMock({
  user = {
    id: "user-1",
    email: "partner@example.com",
    user_metadata: { full_name: "Partner" },
  },
  rpcData = "accepted",
  rpcError = null,
}: {
  user?: { id: string; email?: string; user_metadata: { full_name?: string } } | null;
  rpcData?: string | null;
  rpcError?: unknown;
} = {}) {
  const profileUpsert = vi.fn(async () => ({ error: null }));
  const rpc = vi.fn(async () => ({ data: rpcData, error: rpcError }));
  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user } })),
    },
    from: vi.fn((table: string) => {
      if (table !== "profiles") {
        throw new Error(`Unexpected table: ${table}`);
      }

      return { upsert: profileUpsert };
    }),
    rpc,
  };

  return { supabase, profileUpsert, rpc };
}

describe("acceptInvite", () => {
  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset();
    mocks.redirect.mockClear();
    mocks.revalidatePath.mockClear();
  });

  it("returns an error when token is missing", async () => {
    const result = await acceptInvite({}, createFormData());

    expect(result).toEqual({ error: "초대 링크가 올바르지 않습니다." });
    expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("returns a login error when there is no authenticated user", async () => {
    const refs = createSupabaseMock({ user: null });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await acceptInvite({}, createFormData("token-1"));

    expect(result).toEqual({ error: "로그인이 필요합니다." });
    expect(refs.rpc).not.toHaveBeenCalled();
  });

  it("accepts the invite and redirects to dashboard", async () => {
    const refs = createSupabaseMock();
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    await expect(acceptInvite({}, createFormData("token-1"))).rejects.toThrow(
      "NEXT_REDIRECT:/dashboard",
    );

    expect(refs.profileUpsert).toHaveBeenCalledWith({
      id: "user-1",
      email: "partner@example.com",
      display_name: "Partner",
    });
    expect(refs.rpc).toHaveBeenCalledWith("accept_couple_invite", { invite_token: "token-1" });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("returns a specific error when the invite is expired", async () => {
    const refs = createSupabaseMock({ rpcData: "expired_invite" });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await acceptInvite({}, createFormData("token-1"));

    expect(result).toEqual({ error: "만료된 초대 링크입니다. 새 링크를 요청해주세요." });
  });
});
