export type CoupleRole = "admin" | "lite";

export type DashboardHeaderLink = {
  href: string;
  label: string;
};

export function getDashboardHeaderLinks(role: CoupleRole): DashboardHeaderLink[] {
  const sharedLinks = [{ href: "/subscribe", label: "고정비 시뮬레이터" }];

  if (role === "lite") {
    return sharedLinks;
  }

  return [...sharedLinks, { href: "/onboarding", label: "이번 달 값 수정" }];
}
