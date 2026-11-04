import { test, expect } from '@playwright/test';
import { cardPrices, resultCount, waitForCatalog } from './helpers.js';

test.describe('Browse & filter the catalog', () => {
  test('browse from the categories index into a category', async ({ page }) => {
    await page.goto('/en/categories');
    await page.locator('main a[href="/en/categories/electronics"]').first().click();
    await expect(page).toHaveURL(/\/en\/categories\/electronics$/);
    await expect(page.getByRole('heading', { level: 1, name: /Electronics/i })).toBeVisible();
    await waitForCatalog(page);
    // Every product in the grid links to a product page
    const hrefs = await page.locator('[data-card] h3 a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const h of hrefs) expect(h).toMatch(/^\/en\/products\/[a-z0-9-]+$/);
  });

  test('sorting by price updates the URL and orders the results', async ({ page }) => {
    await page.goto('/en/shop');
    await waitForCatalog(page);
    const total = await resultCount(page);

    await page.getByRole('combobox', { name: 'Sort' }).selectOption('price-asc');
    await expect(page).toHaveURL(/[?&]sort=price-asc/);
    await waitForCatalog(page);
    const asc = await cardPrices(page);
    expect(asc.length).toBeGreaterThan(3);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));

    await page.getByRole('combobox', { name: 'Sort' }).selectOption('price-desc');
    await expect(page).toHaveURL(/[?&]sort=price-desc/);
    await expect.poll(async () => (await cardPrices(page))[0]).toBeGreaterThan(asc[0]);
    const desc = await cardPrices(page);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));

    // sorting never changes how many products match
    expect(await resultCount(page)).toBe(total);
  });

  test('a price filter narrows the results, is reflected in the URL and can be removed', async ({ page, isMobile }) => {
    await page.goto('/en/shop');
    await waitForCatalog(page);
    const total = await resultCount(page);

    const chip = /^\$0\s*–\s*\$100$/;
    if (isMobile) {
      await page.getByRole('button', { name: /^Filters/ }).click();
      const drawer = page.getByRole('dialog', { name: 'Filters' });
      await drawer.getByRole('button', { name: chip }).click();
      await drawer.getByRole('button', { name: /^Show \d+ results$/ }).click();
    } else {
      await page.getByRole('complementary', { name: 'Filters' }).getByRole('button', { name: chip }).click();
    }

    await expect(page).toHaveURL(/[?&]max=10000/);
    await expect.poll(() => resultCount(page)).toBeLessThan(total);
    await waitForCatalog(page);
    for (const p of await cardPrices(page)) expect(p).toBeLessThanOrEqual(100);

    // the URL is shareable: reloading keeps the filter
    await page.reload();
    await waitForCatalog(page);
    expect(await resultCount(page)).toBeLessThan(total);

    await page.getByRole('button', { name: /^Remove filter:/ }).click();
    await expect(page).not.toHaveURL(/max=/);
    await expect.poll(() => resultCount(page)).toBe(total);
  });
});
