import { expect, test } from "@playwright/test";
test("renders selectable semantic connections with direction", async ({ page }) => { await page.goto("/"); await expect(page.locator("[data-relation-id]")).toHaveCount(6); await expect(page.locator("[data-relation-id] line").first()).toHaveAttribute("marker-end", /mdl-/); });
