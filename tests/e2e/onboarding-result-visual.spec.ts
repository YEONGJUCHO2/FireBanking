import { expect, test } from "@playwright/test";

test("result bridge preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-result-bridge"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/onboarding-result-preview.png" });
});
