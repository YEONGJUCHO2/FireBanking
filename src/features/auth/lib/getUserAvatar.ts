import type { User } from "@supabase/supabase-js";

export interface UserAvatar {
  url: string | null;
  initial: string;
  alt: string;
}

/**
 * Derives a display avatar from a Supabase user. OAuth providers stash the
 * profile picture in `user_metadata` under a few different keys depending on
 * the provider — Google uses `avatar_url` / `picture`, Kakao uses
 * `avatar_url` / `profile_image_url` (camel or snake). Falls back to the
 * first character of the name/email when no remote image is available.
 */
export function getUserAvatar(user: User | null | undefined): UserAvatar {
  if (!user) return { url: null, initial: "나", alt: "내 프로필" };

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const url =
    pickString(meta, "avatar_url") ??
    pickString(meta, "picture") ??
    pickString(meta, "profile_image_url") ??
    pickString(meta, "profileImageUrl") ??
    null;

  const name =
    pickString(meta, "name") ??
    pickString(meta, "full_name") ??
    pickString(meta, "preferred_username") ??
    pickString(meta, "nickname") ??
    user.email ??
    "나";
  const initial = (name.trim().charAt(0) || "나").toUpperCase();

  return { url, initial, alt: name };
}

function pickString(meta: Record<string, unknown>, key: string): string | null {
  const value = meta[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}
