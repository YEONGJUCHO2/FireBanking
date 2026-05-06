import { expect, test } from "@playwright/test";

test("history preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-history"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/history-preview.png" });
});
