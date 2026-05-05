import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { getUserAvatar } from "./getUserAvatar";

const baseUser = {
  id: "u1",
  app_metadata: {},
  aud: "authenticated",
  created_at: "2026-01-01T00:00:00.000Z",
  email: "test@example.com",
} as unknown as User;

describe("getUserAvatar", () => {
  it("returns Google avatar_url when present", () => {
    const result = getUserAvatar({
      ...baseUser,
      user_metadata: {
        avatar_url: "https://lh3.googleusercontent.com/a/AAA",
        full_name: "지영진",
      },
    } as User);

    expect(result.url).toBe("https://lh3.googleusercontent.com/a/AAA");
    expect(result.alt).toBe("지영진");
    expect(result.initial).toBe("지");
  });

  it("falls back to picture key (Google legacy)", () => {
    const result = getUserAvatar({
      ...baseUser,
      user_metadata: {
        picture: "https://lh3.googleusercontent.com/a/BBB",
        name: "Yeong Jin",
      },
    } as User);

    expect(result.url).toBe("https://lh3.googleusercontent.com/a/BBB");
    expect(result.initial).toBe("Y");
  });

  it("returns Kakao profile_image_url when avatar_url missing", () => {
    const result = getUserAvatar({
      ...baseUser,
      user_metadata: {
        profile_image_url: "https://k.kakaocdn.net/dn/AAA/profile.jpg",
        nickname: "카카오유저",
      },
    } as User);

    expect(result.url).toBe("https://k.kakaocdn.net/dn/AAA/profile.jpg");
    expect(result.alt).toBe("카카오유저");
  });

  it("falls back to email initial when no avatar / name", () => {
    const result = getUserAvatar(baseUser);
    expect(result.url).toBeNull();
    expect(result.initial).toBe("T");
    expect(result.alt).toBe("test@example.com");
  });

  it("returns sane defaults for null user", () => {
    const result = getUserAvatar(null);
    expect(result.url).toBeNull();
    expect(result.initial).toBe("나");
    expect(result.alt).toBe("내 프로필");
  });
});
