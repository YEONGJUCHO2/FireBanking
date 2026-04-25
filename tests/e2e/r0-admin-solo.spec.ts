import { expect, test } from "@playwright/test";

test("landing page shows R0 positioning and Google sign in", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /부부가 함께 순자산과 경제적 자유 진척/ }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Google로 시작하기" })).toBeVisible();
});
