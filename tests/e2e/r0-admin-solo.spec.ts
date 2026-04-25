import { expect, test } from "@playwright/test";

test("landing page shows R0 positioning and Google sign in", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /부부가 함께 순자산과 경제적 자유 진척/ }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Google로 시작하기" })).toBeVisible();
});

test("protected admin pages redirect unauthenticated users home", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: "Google로 시작하기" })).toBeVisible();

  await page.goto("/onboarding");
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: "Google로 시작하기" })).toBeVisible();
});

test("invite preview page explains R0 invite scope", async ({ page }) => {
  await page.goto("/invite/test-token");

  await expect(page.getByRole("heading", { name: "배우자 체크인은 R1에서 열립니다" })).toBeVisible();
  await expect(page.getByText("초대 의향을 확인하기 위한 알파 기능")).toBeVisible();
});
