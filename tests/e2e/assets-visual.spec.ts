import { expect, test } from "@playwright/test";

test("assets preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-assets"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/assets-preview.png" });
});
