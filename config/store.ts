/**
 * Central store + brand configuration. Change the brand, currency,
 * shipping policy or supported locales here — the UI reads from this file only.
 */
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const localeMeta: Record<Locale, { dir: "ltr" | "rtl"; intl: string; label: string; short: string }> = {
  en: { dir: "ltr", intl: "en-US", label: "English", short: "EN" },
  ar: { dir: "rtl", intl: "ar-EG", label: "العربية", short: "ع" },
};

export const store = {
  name: "VANTA",
  tagline: { en: "Beyond Shopping", ar: "ما بعد التسوق" },
  currency: "USD",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Contact details are intentionally empty placeholders: never invent real ones. */
  contact: { email: "hello@example.com", phone: "", address: "" },
  social: [
    { id: "instagram", label: "Instagram", href: "#" },
    { id: "x", label: "X", href: "#" },
    { id: "youtube", label: "YouTube", href: "#" },
  ],
  /** Shipping & returns policy — "benefits" sections only show what is configured here. */
  policy: {
    shipping: {
      standard: { id: "standard", price: 900, etaDays: [3, 6] as [number, number] },
      express: { id: "express", price: 1900, etaDays: [1, 2] as [number, number] },
      pickup: { id: "pickup", price: 0, etaDays: [1, 1] as [number, number] },
      freeOver: 15000, // minor units
    },
    returnsDays: 30,
    supportHours: { en: "Mon–Fri, 9:00–17:00", ar: "الاثنين–الجمعة، 9:00–17:00" },
    paymentMethods: ["card", "cod", "wallet"] as const,
  },
  taxRate: 0, // demo: tax not calculated
  brandColors: { accent: "#d4ff3a", accent2: "#ff5b2e" },
} as const;

export type ShippingMethodId = "standard" | "express" | "pickup";

/** Demo discount codes with explicit, documented rules. */
export const discountCodes = {
  VANTA10: { type: "percent", value: 10, minSubtotal: 0 },
  WELCOME15: { type: "percent", value: 15, minSubtotal: 10000 },
  FREESHIP: { type: "shipping", value: 100, minSubtotal: 0 },
} as const;
export type DiscountCode = keyof typeof discountCodes;
