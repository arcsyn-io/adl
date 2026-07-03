import { expect, type Download, type Page } from "@playwright/test";

export async function resetWorkspace(page: Page): Promise<void> {
  await page.addInitScript(() => localStorage.clear());
}
export async function expectDownload(download: Download, extension: string): Promise<void> {
  expect(download.suggestedFilename()).toMatch(new RegExp(`\\.${extension}$`));
  expect(await download.createReadStream()).not.toBeNull();
}
