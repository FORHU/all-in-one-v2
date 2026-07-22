import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("loads and shows sign in form", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /admin central/i }),
    ).toBeVisible();
  });

  test("sign in button is visible", async ({ page }) => {
    await page.goto("/");
    const btn = page.getByRole("button", {
      name: /sign in to dashboard/i,
    });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test("submitting the form redirects to dashboard", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel(/work email/i).fill("demo@company.com");
    await page.getByLabel(/^password$/i).fill("password");
    await page.getByRole("button", { name: /sign in to dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(
      page.getByRole("heading", { name: /dashboard/i }),
    ).toBeVisible();
  });
});
