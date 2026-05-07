import { expect, test } from "@playwright/test";

test("landing page shows R0 positioning and Google sign in", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /부부가 함께 순자산과 경제적 자유 진척/ }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Google로 시작하기" })).toBeVisible();
});

test("core unauthenticated preview pages render honest empty states", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText("FIRE까지 남은 금액").filter({ visible: true }).first()).toBeVisible();

  await page.goto("/subscribe");
  await expect(page.getByText("월 세후 수입")).toBeVisible();
  await expect(page.getByText("0만원").first()).toBeVisible();

  await page.goto("/settings");
  await expect(page.getByText("미연결")).toBeVisible();
});

test("invite preview page explains spouse lite check-in scope", async ({ page }) => {
  await page.goto("/invite/test-token");

  await expect(page.getByRole("heading", { name: "입력은 3개만 필요해요" })).toBeVisible();
  await expect(page.getByText("이번 달 가족 결과에 합산돼요")).toBeVisible();
});
