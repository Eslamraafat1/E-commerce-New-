import { store } from "@/config/store";
import { LocLink } from "@/components/providers/i18n";
import type { Category } from "@/lib/api/types";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";
import { FooterText } from "./footer-text";

/** Static shell; all strings come through the client-side i18n helper so the footer stays one component. */
export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="relative mt-24 border-t border-line bg-bg2/60">
      <div className="container-x py-16">
        <FooterText
          logo={<Logo />}
          newsletter={<NewsletterForm id="footer-nl" />}
          categories={categories.map((c) => ({ href: `/categories/${c.slug}`, name: c.name }))}
          social={store.social.map((s) => ({ ...s }))}
        />
      </div>
      <p aria-hidden className="display pointer-events-none select-none overflow-hidden whitespace-nowrap text-center text-[22vw] leading-[0.8] text-fg/[0.04] rtl:hidden">{store.name}</p>
    </footer>
  );
}

export { LocLink };
