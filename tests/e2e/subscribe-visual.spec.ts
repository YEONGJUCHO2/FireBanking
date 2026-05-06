import { expect, test } from "@playwright/test";

test("subscribe preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-simulator"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/subscribe-preview.png" });
});
