import { beforeEach, describe, expect, it, vi } from "vitest";
import { unlinkPartner } from "./unlinkPartner";

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

function createFormData(coupleId?: string) {
  const formData = new FormData();

  if (coupleId !== undefined) {
    formData.set("coupleId", coupleId);
  }

  return formData;
}

function createSupabaseMock({
  user = { id: "admin-1" },
  rpcData = "unlinked",
  rpcError = null,
}: {
  user?: { id: string } | null;
  rpcData?: string | null;
  rpcError?: unknown;
} = {}) {
  const rpc = vi.fn(async () => ({ data: rpcData, error: rpcError }));
  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user } })),
    },
    rpc,
  };

  return { supabase, rpc };
}

describe("unlinkPartner", () => {
  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset();
    mocks.redirect.mockClear();
    mocks.revalidatePath.mockClear();
  });

  it("returns an error when coupleId is missing", async () => {
    const result = await unlinkPartner(createFormData());

    expect(result).toEqual({ error: "워크스페이스 정보를 찾지 못했습니다." });
    expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("returns a login error when there is no authenticated user", async () => {
    const refs = createSupabaseMock({ user: null });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await unlinkPartner(createFormData("couple-1"));

    expect(result).toEqual({ error: "로그인이 필요합니다." });
    expect(refs.rpc).not.toHaveBeenCalled();
  });

  it("unlinks the connected spouse and refreshes the dashboard", async () => {
    const refs = createSupabaseMock();
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    await expect(unlinkPartner(createFormData("couple-1"))).rejects.toThrow(
      "NEXT_REDIRECT:/dashboard",
    );

    expect(refs.rpc).toHaveBeenCalledWith("unlink_couple_partner", {
      target_couple_id: "couple-1",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("returns an admin-only error when the RPC rejects ownership", async () => {
    const refs = createSupabaseMock({ rpcData: "not_admin" });
    mocks.createSupabaseServerClient.mockResolvedValue(refs.supabase);

    const result = await unlinkPartner(createFormData("couple-1"));

    expect(result).toEqual({ error: "관리자 계정만 배우자 연동을 해제할 수 있습니다." });
  });
});
