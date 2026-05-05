import { expect, test } from "@playwright/test";

test("onboarding preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-onboarding"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/onboarding-preview.png" });
});
