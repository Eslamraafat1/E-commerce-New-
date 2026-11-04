import { expect } from '@playwright/test';

/** Header controls (language / theme) live in the mobile menu below the md breakpoint. */
export async function openMobileMenuIfNeeded(page) {
  const viewport = page.viewportSize();
  if (viewport && viewport.width < 768) {
    await page.getByRole('button', { name: 'Open menu' }).click();
  }
}

/** Waits until the client-rendered catalog has finished loading results. */
export async function waitForCatalog(page) {
  await expect(page.getByRole('status').filter({ hasText: /\d+ products/ })).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('[aria-busy="false"]').first()).toBeAttached();
  await expect(page.locator('[data-card]').first()).toBeVisible();
}

/** Total number of results shown in the catalog status line ("46 products"). */
export async function resultCount(page) {
  const text = await page.getByRole('status').filter({ hasText: /\d+ products/ }).innerText();
  return Number(text.match(/(\d+)/)[1]);
}

/** Current price (first amount) of each product card currently rendered. */
export async function cardPrices(page) {
  const texts = await page.locator('[data-card] p.tabular').allInnerTexts();
  return texts.map((t) => Number(t.match(/\$([\d,]+(?:\.\d+)?)/)[1].replace(/,/g, '')));
}

/** The header cart button exposes its count in its accessible name, e.g. "Cart (2)". */
export const cartButton = (page) => page.locator('#cart-button');

/** Parses every JSON-LD block on the page (throws if any is invalid JSON). */
export async function jsonLd(page) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((b) => JSON.parse(b));
}
