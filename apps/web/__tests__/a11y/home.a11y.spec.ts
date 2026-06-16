import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Home Page Accessibility", () => {
  test("should not have any automatically detectable violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("Login Page Accessibility", () => {
  test("should not have any automatically detectable violations", async ({ page }) => {
    await page.goto("/login");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
