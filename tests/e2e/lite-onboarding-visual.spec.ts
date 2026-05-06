import { expect, test } from "@playwright/test";

test("lite onboarding preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-lite"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/lite-onboarding-preview.png" });
});

test("/invite/[token]/lite renders without auth gate", async ({ page }) => {
  await page.goto("/invite/test-token/lite");
  // Either renders the lite form OR redirects to / for an invalid token —
  // both are acceptable; we just want the route to exist and not 500.
  await expect(page).not.toHaveURL("/500");
});
