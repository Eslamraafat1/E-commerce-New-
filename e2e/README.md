# E2E Tests — VANTA Store

End-to-end tests written with **Playwright**, run on **Desktop Chrome** and **Mobile Chrome (Pixel 7)**.
31 tests → 62 runs per full suite (50 executed; the 12 SEO tests run on desktop only because their output doesn't depend on the viewport).

## What is tested

| Spec | Checks |
|---|---|
| `checkout.spec.js` | Add to cart → header cart count → cart page subtotal / shipping / total (incl. free-shipping threshold) → discount codes (invalid + `VANTA10`) → multi-step checkout with Zod validation errors (`aria-invalid`, messages) → demo order → confirmation page, cart emptied |
| `catalog.spec.js` | Category browsing; sort by price updates `?sort=` and orders prices; price filter updates `?max=`, narrows results, survives reload, can be removed (sidebar on desktop, drawer on mobile) |
| `i18n-a11y.spec.js` | EN → AR switch (`lang="ar"`, `dir="rtl"`, Arabic content, remembered by the locale redirect); theme toggle persists; localized 404 pages with real HTTP 404 status (unknown routes and unknown product slugs) |
| `seo.spec.js` | Canonical / hreflang / `og:url` / `og:image` are absolute https and never localhost; Twitter card; JSON-LD (`WebSite` + `SearchAction`, `Product` + offer, `BreadcrumbList`) parses; OG image is a PNG; `robots.txt` and `sitemap.xml`; `noindex` on private pages |
| `smoke.spec.js` | Home in both locales, skip link, shop and category pages, product page, size required before Add to cart, 404 |

## Run locally

```bash
cd e2e
npm ci
npx playwright install chromium
BASE_URL=http://localhost:3000 npm test    # against a local `npm run build && npm start`
npm test                                   # against the live site
npm run report                             # open the HTML report
```

`CHROMIUM_PATH=/path/to/chromium` reuses an existing Chromium binary instead of downloading one.

In CI (`.github/workflows/e2e.yml`) the app is linted, built and started with `npm start`, and the suite runs against that local production build on every push to `main` and every pull request.
