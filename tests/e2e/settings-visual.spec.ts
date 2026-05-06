import { expect, test } from "@playwright/test";

test("settings preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-settings"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/settings-preview.png" });
});

test("login preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-login"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/login-preview.png" });
});

test("entry route renders R0 positioning", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /부부가 함께 순자산과 경제적 자유 진척/ }),
  ).toBeVisible();
});
