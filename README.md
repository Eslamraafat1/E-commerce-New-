# 🛍️ VANTA — 3D E-commerce Store

[![E2E Tests](https://github.com/Eslamraafat1/E-commerce-New-/actions/workflows/e2e.yml/badge.svg)](https://github.com/Eslamraafat1/E-commerce-New-/actions/workflows/e2e.yml)

A modern, **bilingual (English / Arabic)** multi-category e-commerce storefront with interactive **3D product visuals**, cinematic page transitions and smooth scrolling.

🔗 **Live demo:** https://e-commerce-new2-delta.vercel.app/en

---

## ✨ Features

- 🌐 Bilingual UI (EN / AR) with RTL support
- 🧊 Interactive 3D scenes built with Three.js (React Three Fiber + Drei)
- 🎬 Page/route transitions and micro-interactions with GSAP & Framer Motion
- 🧈 Smooth scrolling with Lenis, plus a motion on/off switch for accessibility
- 🗂️ Multi-category product catalog with demo data
- ✅ Type-safe forms with React Hook Form + Zod validation
- 📱 Fully responsive on desktop, tablet and mobile

## 🛠 Tech Stack

| Area | Tools |
|---|---|
| Framework | Next.js (App Router), React, TypeScript |
| 3D | Three.js, @react-three/fiber, @react-three/drei |
| Animation | GSAP, Framer Motion, Lenis |
| Forms | React Hook Form, Zod |
| Testing | Playwright (E2E), GitHub Actions CI |
| Deployment | Vercel |

## 🧪 Testing

Automated end-to-end tests with **Playwright** run on every push via **GitHub Actions**, on both desktop and mobile Chrome (20 tests):

- English (LTR) and Arabic (RTL) home pages
- Shop and category pages render correctly
- Product page flow: a size must be selected before **Add to cart** is enabled
- Unknown routes return HTTP 404
- Accessibility: skip-to-content link

See [`e2e/`](./e2e) for details and how to run the tests locally.

## 🚀 Getting Started

```bash
git clone https://github.com/Eslamraafat1/E-commerce-New-.git
cd E-commerce-New-
npm install
npm run dev
```

Then open http://localhost:3000.

## 👤 Author

**Eslam Raafat** — Frontend Developer & QA Engineer
[LinkedIn](https://www.linkedin.com/in/eslamraafat-dev) · [GitHub](https://github.com/Eslamraafat1)
