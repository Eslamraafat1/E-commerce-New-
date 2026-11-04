<div align="center">

# VANTA — Bilingual 3D Commerce Storefront

**A production-style Next.js 16 storefront with English / Arabic (RTL) routing, a WebGL hero, technical SEO built in, and a Playwright E2E suite running in CI.**

[![E2E Tests](https://github.com/Eslamraafat1/E-commerce-New-/actions/workflows/e2e.yml/badge.svg)](https://github.com/Eslamraafat1/E-commerce-New-/actions/workflows/e2e.yml)
![Next.js](https://img.shields.io/badge/Next.js-16.4.3-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-0.186-000000?logo=threedotjs&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock&logoColor=black)
![Playwright](https://img.shields.io/badge/Playwright-1.48-2EAD33?logo=playwright&logoColor=white)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)](https://e-commerce-new2-delta.vercel.app/en)

[**Live Demo**](https://e-commerce-new2-delta.vercel.app/en) · [**Portfolio**](https://new-portfolio-ashy-xi.vercel.app) · [**LinkedIn**](https://www.linkedin.com/in/eslamraafat-dev/)

<br />

<img src="docs/screenshots/desktop.png" alt="VANTA home page on desktop: hero carousel with a product photo over a WebGL blob" width="72%" />
&nbsp;
<img src="docs/screenshots/mobile.png" alt="VANTA home page on mobile (iPhone 13)" width="22%" />

</div>

---

## Overview

VANTA is a **concept / demo store** I designed and built end to end to show how I approach a real e-commerce front end: a multi-category catalog (7 categories, 4 collections, 46 sample products), a full cart-to-checkout flow, customer account and admin screens, and every page available in **English and Arabic with a true RTL layout**.

It is not a client project and nothing is sold. All products, reviews and ratings are sample data, and orders, auth and payments run in an honest **Demo Mode**. The front end is still built against a typed API layer and a documented backend contract ([`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md)), so moving to a real backend means changing one environment variable, not rewriting components.

The problem it explores: **how to ship an immersive, animation-heavy storefront without giving up the things that actually make money: SEO, performance, accessibility and reliability.**

## Key Features

### Shopping flow
- Catalog with **URL-synced filters**, sorting, grid/list views, "load more", a mobile filter drawer, and skeleton, empty and error-with-retry states
- Product pages with **exact variant resolution** (size/colour → SKU, price, stock, image); unavailable options are marked `aria-disabled` and **Add to cart** stays locked until a variant is chosen
- Quick View modal, cart drawer, wishlist and recently viewed items
- Checkout with delivery methods, demo discount codes with explicit rules (`config/store.ts`) and an order confirmation page
- **Server-side re-pricing**: the demo `POST /api/orders` validates the payload with Zod and recomputes totals and stock from the catalog. Client prices are never trusted
- `Ctrl / Cmd + K` command palette for search, navigation and quick actions
- Demo account area (profile, addresses, orders) and admin screens (products, categories, collections, orders, settings)

### 3D & motion
- WebGL hero built with **React Three Fiber + Drei** (`MeshDistortMaterial`, `PerformanceMonitor`), **lazy-loaded with `next/dynamic` (`ssr: false`)**
- The 3D scene is **skipped automatically** on reduced-motion, Save-Data, low-memory / low-core devices, or when WebGL is unavailable
- GSAP + ScrollTrigger hero carousel, pinned horizontal showcase and scroll-linked sections, all wrapped in `gsap.matchMedia()` so they respect `prefers-reduced-motion`
- Framer Motion micro-interactions, a route-transition curtain, React `ViewTransition` on the product page and the View Transitions API for theme switching
- Lenis smooth scrolling, plus a **motion on/off toggle** in the header that is saved per visitor

### Internationalization & RTL
- Locale-prefixed routing (`/en/...`, `/ar/...`) for every page
- `proxy.ts` sends locale-less URLs to the right locale using a `vanta-locale` cookie, then the `Accept-Language` header
- `<html lang dir>` set per locale, with dedicated Arabic typography (IBM Plex Sans Arabic)
- Locale-aware currency, number and date formatting via `Intl`
- Typed dictionaries (`lib/i18n/en.ts`, `lib/i18n/ar.ts`) shared by server and client components

### Forms & validation
- **React Hook Form + Zod** (`@hookform/resolvers`) for checkout, login/register/forgot-password, profile and address forms, with localized error messages
- **Zod schemas also validate on the server** in the API route handlers (`lib/api/schemas.ts`)

### Accessibility
- Skip-to-content link and a focusable `<main>` landmark
- Reusable accessible dialog: portal, focus trap, focus restoration, `Escape` to close, scroll lock
- Variant pickers exposed as ARIA radio groups (covered by the E2E suite)
- Animated split-letter headings keep their accessible name
- Light / dark theme applied before first paint (no flash), following `prefers-color-scheme`

## Tech Stack

| Area | Tools |
|---|---|
| Framework | **Next.js 16.4.3** (App Router, Cache Components, Partial Prefetching, Turbopack), **React 19.3** |
| Language | **TypeScript 5** (`strict`) |
| Styling | **Tailwind CSS 4**, CSS custom-property design tokens, `next/font` (Geist, Bricolage Grotesque, IBM Plex Sans Arabic) |
| 3D | three 0.186, @react-three/fiber 9.8, @react-three/drei 10.7 |
| Motion | GSAP 3.15 (ScrollTrigger), Framer Motion 14.7, Lenis 1.3 |
| Forms & validation | React Hook Form 7.91, Zod 4.6, @hookform/resolvers 6 |
| State | `useSyncExternalStore` + localStorage persisted stores (no state library) |
| Icons | lucide-react |
| Testing | Playwright 1.48 (E2E), GitHub Actions CI |
| Quality | ESLint 9 (`eslint-config-next` core-web-vitals + TypeScript) |
| Hosting | Vercel |

## Architecture Highlights

- **Locale routing in `proxy.ts`.** Next.js 16 renamed Middleware to Proxy. Every page lives under `app/[locale]/`, `generateStaticParams` pre-renders both locales, and unknown locales return `notFound()`.
- **A single data layer (`lib/api/*`).** UI components never contain URLs. A typed `apiFetch` wrapper handles the `{ data, meta }` / `{ error }` envelope, typed `ApiError`s and `AbortController` cancellation. `NEXT_PUBLIC_USE_DEMO_API` switches between the built-in Route Handlers (`app/api/*`, backed by `data/demo/*`) and a real backend at `NEXT_PUBLIC_API_BASE_URL`.
- **A documented backend contract.** Endpoints, query params, response shapes and what must be replaced before production are listed in [`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md).
- **Small persisted stores (`lib/persisted-store.ts`).** Cart, wishlist, recently viewed, discount and delivery state use `useSyncExternalStore` with a deterministic server snapshot, so hydration never mismatches. They also stay in sync across tabs through the `storage` event.
- **Client-only URL state for filters.** `history.replaceState`, which Next.js integrates with `useSearchParams`, keeps filters shareable without a server round-trip.
- **Central store config (`config/store.ts`).** Brand, currency, locales, shipping rules, return window and discount codes are defined in one place.
- **Prices in integer minor units** end to end, which avoids floating-point rounding errors.

## SEO & Performance

What the code actually implements:

| Technique | Where |
|---|---|
| Metadata API with title template, description, Open Graph and Twitter cards | `app/[locale]/layout.tsx` (`generateMetadata`) |
| Per-page **canonical URLs + `hreflang` alternates** (`en` / `ar`) | `lib/page.ts` (`pageMeta`) |
| **Product JSON-LD** (`Product`, `AggregateOffer`, `AggregateRating`, availability), escaped against `</script>` injection | `app/[locale]/products/[slug]/page.tsx` |
| Product-specific Open Graph images | product `generateMetadata` |
| Dynamic **`sitemap.xml`** covering every static page, category, collection, article and product in both locales, with `xhtml:link` hreflang alternates | `app/sitemap.ts` |
| **`robots.txt`** that blocks `/api/`, cart, checkout, account, admin and order confirmation | `app/robots.ts` |
| `noindex` on private and utility pages (account, search, recently viewed, auth) | `pageMeta(..., noindex = true)` |
| Static generation of every product page through `generateStaticParams` | products, categories, collections, journal |
| `next/image` with AVIF/WebP and restricted quality levels, plus a fallback for images that fail to load | `next.config.ts`, `components/ui/smart-image.tsx` |
| Heavy client components code-split with `next/dynamic` (3D scene, Quick View, cart drawer, command palette) | `components/home/hero.tsx`, `components/providers/ui.tsx` |
| `next/font` self-hosted fonts with `display: swap` and a per-locale font stack | `app/[locale]/layout.tsx` |
| Responsive `viewport` and `themeColor` for light and dark | `app/[locale]/layout.tsx` |
| Real HTTP **404** for unknown routes (catch-all `[...rest]` → `notFound()`) | `app/[locale]/[...rest]/page.tsx` |

## Testing & QA

### Automated: Playwright E2E
The suite in [`e2e/`](e2e) runs against the deployed site (or any `BASE_URL`) in **two projects, Desktop Chrome and Mobile Chrome (Pixel 7)**, which gives **20 test runs** (10 tests × 2 viewports):

| Area | What is asserted |
|---|---|
| i18n | `/en` returns 200 with `lang="en"` `dir="ltr"`; `/ar` switches to `lang="ar"` `dir="rtl"` |
| Accessibility | Skip-to-content link is present |
| Catalog | Shop page renders its H1 and product links; Fashion, Electronics and Accessories category pages render the right heading |
| Product | Title and H1 render; **Add to cart stays locked until a size is picked** (ARIA radio `aria-checked`) |
| Errors | Unknown routes return HTTP **404** |

Tests use role- and accessible-name-based locators (`getByRole`) rather than brittle CSS selectors.

**CI:** [`.github/workflows/e2e.yml`](.github/workflows/e2e.yml) runs the suite on every push to `main`, on every pull request, and on manual dispatch (Node 20, Chromium). Failed tests are retried twice with traces on the first retry, and the HTML report is uploaded as a build artifact for 14 days.

```bash
cd e2e
npm install
npx playwright install chromium
npm test                                  # against the live site
BASE_URL=http://localhost:3000 npm test   # against a local dev server
npm run report                            # open the HTML report
```

### Manual QA
According to [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md), the app was also checked by hand: a responsive sweep of 40 routes × 2 locales at 9 widths (320 to 1920 px) looking for horizontal overflow and JS errors, plus walkthroughs of filters, quick view focus handling, the variant → SKU/image mapping, discount codes, checkout validation and the language and theme switches. That file also lists the known limitations.

## Project Structure

```text
.
├── app/
│   ├── [locale]/            # All pages, in /en and /ar (35 routes: shop, PDP, cart, checkout, account, admin…)
│   │   ├── layout.tsx       # <html lang dir>, fonts, metadata, providers
│   │   └── [...rest]/       # Catch-all → real 404
│   ├── api/                 # Demo Route Handlers: products, categories, collections, search, orders, contact
│   ├── sitemap.ts           # Multilingual sitemap with hreflang
│   └── robots.ts
├── components/
│   ├── home/                # Hero (+ lazy R3F scene) and homepage sections
│   ├── shop/                # Catalog, PDP, variants, quick view, cart, checkout
│   ├── layout/              # Header, mega menu, command palette, footer
│   ├── motion/              # GSAP setup, page curtain, motion primitives
│   ├── providers/           # i18n, UI (modals, shortcuts), smooth scroll
│   ├── account/ admin/      # Demo account and admin screens
│   └── ui/                  # Accessible dialog, smart image, FAQ, page header
├── lib/
│   ├── api/                 # Typed client, Zod schemas, errors, cart/pricing logic
│   ├── i18n/                # en / ar dictionaries
│   └── persisted-store.ts   # useSyncExternalStore + localStorage
├── config/store.ts          # Brand, locales, currency, shipping, discount rules
├── data/demo/               # Sample catalog (products, categories, journal)
├── e2e/                     # Playwright suite + config
├── docs/                    # Backend integration guide, screenshots
├── proxy.ts                 # Locale detection and redirect
└── next.config.ts           # Cache Components, image formats, Turbopack
```

## Getting Started

**Prerequisites:** Node.js 20 or newer (CI runs Node 20) and npm.

```bash
git clone https://github.com/Eslamraafat1/E-commerce-New-.git
cd E-commerce-New-
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. You will be redirected to `/en` or `/ar`.

### Environment variables

| Variable | Default in `.env.example` | Purpose |
|---|---|---|
| `NEXT_PUBLIC_USE_DEMO_API` | `true` | `true` uses the built-in demo API (`/api/*`); `false` uses your backend |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api` | Real backend base URL (example value only) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Absolute URL for canonical links, Open Graph, sitemap and robots |

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `cd e2e && npm test` | Run the Playwright E2E suite |

## Deployment

The app is deployed on **Vercel**: https://e-commerce-new2-delta.vercel.app/en

To deploy your own copy, import the repository into Vercel (it detects Next.js automatically) and set the environment variables above. Set `NEXT_PUBLIC_SITE_URL` to the production domain so canonical URLs, hreflang links and the sitemap point to it. Before handling real customers, replace demo auth, payments and persistence as described in [`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md).

## Author

**Eslam Raafat** — Front-End Developer (React · Next.js · TypeScript)
Technical SEO · Web performance · Manual & automated QA · Bilingual EN/AR (RTL) interfaces

- Portfolio: [new-portfolio-ashy-xi.vercel.app](https://new-portfolio-ashy-xi.vercel.app)
- LinkedIn: [linkedin.com/in/eslamraafat-dev](https://www.linkedin.com/in/eslamraafat-dev/)
- GitHub: [@Eslamraafat1](https://github.com/Eslamraafat1)
- Email: [eslamraafat736@gmail.com](mailto:eslamraafat736@gmail.com)

> Open to Front-End Developer roles. If you're hiring, I'd be glad to talk.
