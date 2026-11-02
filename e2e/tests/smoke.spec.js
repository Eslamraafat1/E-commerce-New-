import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('English home loads with correct title and LTR layout', async ({ page }) => {
    const res = await page.goto('/en');
    expect(res.status()).toBe(200);
    await expect(page).toHaveTitle(/VANTA/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });

  test('Arabic home switches to RTL', async ({ page }) => {
    const res = await page.goto('/ar');
    expect(res.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('has a skip-to-content link for keyboard users', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('a[href="#main"]').first()).toBeAttached();
  });
});

test.describe('Catalog', () => {
  test('Shop page lists products', async ({ page }) => {
    const res = await page.goto('/en/shop');
    expect(res.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Shop all/i);
    // products are rendered client-side, so wait for the first card link
    await expect(page.locator('a[href*="/en/products/"]').first()).toBeAttached({ timeout: 20_000 });
  });

  for (const [slug, name] of [
    ['fashion', 'Fashion'],
    ['electronics', 'Electronics'],
    ['accessories', 'Accessories'],
  ]) {
    test(`Category page: ${name}`, async ({ page }) => {
      const res = await page.goto(`/en/categories/${slug}`);
      expect(res.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(new RegExp(name, 'i'));
    });
  }
});

test.describe('Product page', () => {
  test('shows product name and add-to-cart action', async ({ page }) => {
    const res = await page.goto('/en/products/court-low-sneaker');
    expect(res.status()).toBe(200);
    await expect(page).toHaveTitle(/Court Low Sneaker/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Court Low Sneaker/i);
    expect(await page.getByText(/add to (cart|bag)/i).count()).toBeGreaterThan(0);
  });
});

test.describe('Error handling', () => {
  test('unknown routes return 404', async ({ page }) => {
    const res = await page.goto('/en/this-page-does-not-exist');
    expect(res.status()).toBe(404);
  });
});
