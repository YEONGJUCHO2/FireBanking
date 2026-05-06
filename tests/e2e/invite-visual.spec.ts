import { expect, test } from "@playwright/test";

test("invite preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-invite"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/invite-preview.png" });
});

test("/invite/[token] renders the R0 explainer without auth", async ({ page }) => {
  await page.goto("/invite/test-token");
  await expect(page.locator('[data-screen-label="invite-accept"]')).toBeVisible();
});
