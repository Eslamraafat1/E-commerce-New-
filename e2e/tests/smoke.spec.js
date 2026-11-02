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
    // headings are split into animated letters, so assert on the accessible name
    await expect(page.getByRole('heading', { level: 1, name: /Shop all/i })).toBeVisible();
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
      await expect(page.getByRole('heading', { level: 1, name: new RegExp(name, 'i') })).toBeVisible();
    });
  }
});

test.describe('Product page', () => {
  test('shows product name', async ({ page }) => {
    const res = await page.goto('/en/products/court-low-sneaker');
    expect(res.status()).toBe(200);
    await expect(page).toHaveTitle(/Court Low Sneaker/);
    await expect(page.getByRole('heading', { level: 1, name: /Court Low Sneaker/i })).toBeVisible();
  });

  test('user must pick a size before adding to cart', async ({ page }) => {
    await page.goto('/en/products/court-low-sneaker');
    // before choosing a size, the CTA asks the user to select an option
    await expect(page.getByRole('button', { name: /select an option/i })).not.toHaveCount(0);
    await expect(page.getByRole('button', { name: /^add to cart$/i })).toHaveCount(0);

    // choose a size (rendered as a radio group)
    const size = page.getByRole('radio', { name: '42', exact: true }).first();
    await size.click();
    await expect(size).toHaveAttribute('aria-checked', 'true');

    // the CTA becomes "Add to cart"
    await expect(page.getByRole('button', { name: /^add to cart$/i })).not.toHaveCount(0);
  });
});

test.describe('Error handling', () => {
  test('unknown routes return 404', async ({ page }) => {
    const res = await page.goto('/en/this-page-does-not-exist');
    expect(res.status()).toBe(404);
  });
});
