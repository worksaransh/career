import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("See Your Future");
  });

  test("should have navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("should navigate to features", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /features/i }).first().click();
    await expect(page).toHaveURL(/\/features/);
  });

  test("should navigate to pricing", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /pricing/i }).first().click();
    await expect(page).toHaveURL(/\/pricing/);
  });
});
