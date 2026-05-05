import { expect, test } from "@playwright/test";

test.describe("dashboard visual smoke", () => {
  test("dashboard preview mounts in showcase", async ({ page }) => {
    await page.goto("/showcase");
    const preview = page.locator('[data-od-id="phone-mockup-dashboard"]');
    await expect(preview).toBeVisible();
    await preview.screenshot({ path: "test-results/dashboard-preview.png" });
  });
});
