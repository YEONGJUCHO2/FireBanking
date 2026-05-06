import { expect, test } from "@playwright/test";

test("together preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-together"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/together-preview.png" });
});
