export function getSafeAuthRedirectPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/onboarding";
  }

  return next;
}
