import { test, expect } from '@playwright/test';
import { jsonLd } from './helpers.js';

// SEO output is identical on every viewport, so these run once (desktop project only).
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'viewport-independent');
});

const absoluteHttps = (url) => {
  expect(url, 'must be an absolute https URL').toMatch(/^https:\/\//);
  expect(url, 'must never point to localhost').not.toMatch(/localhost|127\.0\.0\.1/);
};

test.describe('Technical SEO', () => {
  for (const path of ['/en', '/ar', '/en/shop', '/en/categories/fashion', '/en/products/court-low-sneaker']) {
    test(`${path}: canonical, hreflang and Open Graph are absolute production URLs`, async ({ page }) => {
      await page.goto(path);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      absoluteHttps(canonical);
      expect(new URL(canonical).pathname).toBe(path);

      const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((ls) => Object.fromEntries(ls.map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')])));
      expect(Object.keys(alternates).sort()).toEqual(['ar', 'en', 'x-default']);
      Object.values(alternates).forEach(absoluteHttps);

      absoluteHttps(await page.locator('meta[property="og:url"]').getAttribute('content'));
      absoluteHttps(await page.locator('meta[property="og:image"]').first().getAttribute('content'));
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    });
  }

  test('home page has Organization + WebSite JSON-LD with a SearchAction', async ({ page }) => {
    await page.goto('/en');
    const graph = (await jsonLd(page)).flatMap((d) => d['@graph'] ?? [d]);
    const site = graph.find((n) => n['@type'] === 'WebSite');
    expect(graph.some((n) => n['@type'] === 'Organization')).toBe(true);
    expect(site.potentialAction['@type']).toBe('SearchAction');
    expect(site.potentialAction.target.urlTemplate).toContain('/en/search?q={search_term_string}');
  });

  test('product page has Product (with offer) and BreadcrumbList JSON-LD', async ({ page }) => {
    await page.goto('/en/products/court-low-sneaker');
    const data = await jsonLd(page);
    const product = data.find((d) => d['@type'] === 'Product');
    expect(product.name).toBe('Court Low Sneaker');
    expect(product.offers.priceCurrency).toBe('USD');
    expect(product.offers.lowPrice).toBe(139);
    absoluteHttps(product.offers.url);
    const crumbs = data.find((d) => d['@type'] === 'BreadcrumbList');
    expect(crumbs.itemListElement.map((i) => i.name)).toEqual(['Home', 'Shop', 'Fashion', 'Court Low Sneaker']);
  });

  test('category page has BreadcrumbList JSON-LD', async ({ page }) => {
    await page.goto('/ar/categories/fashion');
    const crumbs = (await jsonLd(page)).find((d) => d['@type'] === 'BreadcrumbList');
    expect(crumbs.itemListElement).toHaveLength(3);
    crumbs.itemListElement.forEach((i) => absoluteHttps(i.item));
  });

  test('Open Graph image is a generated 1200×630 PNG', async ({ request }) => {
    const res = await request.get('/en/opengraph-image');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
  });

  test('private pages are noindex', async ({ page }) => {
    await page.goto('/en/search');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('robots.txt blocks private areas and points to an absolute sitemap', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toContain('Disallow: /*/checkout');
    const sitemap = body.match(/Sitemap:\s*(\S+)/)[1];
    absoluteHttps(sitemap);
    expect(sitemap).toMatch(/\/sitemap\.xml$/);
  });

  test('sitemap.xml lists both locales with hreflang alternates', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(100);
    locs.forEach(absoluteHttps);
    expect(locs.some((u) => u.endsWith('/en/products/court-low-sneaker'))).toBe(true);
    expect(locs.some((u) => u.endsWith('/ar/products/court-low-sneaker'))).toBe(true);
    expect(xml).toContain('hreflang="ar"');
  });
});
