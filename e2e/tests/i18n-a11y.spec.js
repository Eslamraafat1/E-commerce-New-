import { test, expect } from '@playwright/test';
import { openMobileMenuIfNeeded } from './helpers.js';

test.describe('Language, theme & error pages', () => {
  test('switching EN → AR keeps the page and flips the document to RTL', async ({ page }) => {
    await page.goto('/en/shop');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await openMobileMenuIfNeeded(page);
    await page.getByRole('button', { name: 'Switch language to العربية' }).click();

    await expect(page).toHaveURL(/\/ar\/shop$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { level: 1, name: 'تسوّق الكل' })).toBeVisible();

    // the choice is remembered: a locale-less URL now redirects to Arabic
    await page.goto('/');
    await expect(page).toHaveURL(/\/ar$/);
  });

  test('theme toggle switches and persists the colour scheme', async ({ page }) => {
    await page.goto('/en');
    const html = page.locator('html');
    const before = await html.getAttribute('data-theme');
    expect(['light', 'dark']).toContain(before);
    await openMobileMenuIfNeeded(page);
    await page.getByRole('button', { name: 'Toggle light / dark theme' }).first().click();
    const after = before === 'dark' ? 'light' : 'dark';
    await expect(html).toHaveAttribute('data-theme', after);
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', after);
  });

  test('unknown pages render a localized 404 with a way back', async ({ page }) => {
    const en = await page.goto('/en/definitely-not-a-page');
    expect(en.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'This page wandered off.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back home' })).toHaveAttribute('href', '/en');

    const ar = await page.goto('/ar/definitely-not-a-page');
    expect(ar.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('unknown product slugs return 404', async ({ page }) => {
    const res = await page.goto('/en/products/no-such-product');
    expect(res.status()).toBe(404);
  });
});
