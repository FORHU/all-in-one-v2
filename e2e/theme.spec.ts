import { test, expect } from "@playwright/test";

test.describe("Dashboard navigation", () => {
  test("sign out returns to login", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel(/work email/i).fill("demo@company.com");
    await page.getByLabel(/^password$/i).fill("password");
    await page.getByRole("button", { name: /sign in to dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: /admin central/i }),
    ).toBeVisible();
  });
});
