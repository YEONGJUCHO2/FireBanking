export type CoupleRole = "admin" | "lite";

export type DashboardHeaderLink = {
  href: string;
  label: string;
};

export function getDashboardHeaderLinks(role: CoupleRole): DashboardHeaderLink[] {
  const sharedLinks = [{ href: "/subscribe", label: "FIRE 생활비 조정기" }];

  if (role === "lite") {
    return sharedLinks;
  }

  return [...sharedLinks, { href: "/onboarding", label: "이번 달 값 수정" }];
}
