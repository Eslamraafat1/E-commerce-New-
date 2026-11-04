import OpengraphImage, { generateStaticParams as ogParams } from "./opengraph-image";
import { store } from "@/config/store";

// Same artwork as the Open Graph image, exposed as twitter:image for X / Twitter cards.
export const alt = `${store.name} — ${store.tagline.en}: a bilingual (English / Arabic) concept storefront`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const generateStaticParams = ogParams;
export default OpengraphImage;
