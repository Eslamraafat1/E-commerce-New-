import type { Category, Collection, Lifestyle } from "@/lib/api/types";
import { img } from "./images";

export const categories: Category[] = [
  { id: "fashion", slug: "fashion", name: { en: "Fashion", ar: "أزياء" }, blurb: { en: "Tailored layers, everyday icons and standout footwear.", ar: "قطع مفصّلة وأساسيات يومية وأحذية لافتة." }, image: img("jacket", 1000), accent: "#d4ff3a" },
  { id: "electronics", slug: "electronics", name: { en: "Electronics", ar: "إلكترونيات" }, blurb: { en: "Audio, wearables and desk tech designed to disappear into your day.", ar: "صوتيات وأجهزة قابلة للارتداء وتقنيات مكتبية تندمج مع يومك." }, image: img("hpDark", 1000), accent: "#5bd1ff" },
  { id: "accessories", slug: "accessories", name: { en: "Accessories", ar: "إكسسوارات" }, blurb: { en: "Bags, watches and finishing touches.", ar: "حقائب وساعات ولمسات أخيرة." }, image: img("bagRed", 1000), accent: "#ff5b2e" },
  { id: "lifestyle", slug: "lifestyle", name: { en: "Lifestyle", ar: "نمط الحياة" }, blurb: { en: "Objects for slower mornings and longer weekends.", ar: "أغراض لصباحات هادئة وعطلات أطول." }, image: img("candle", 1000), accent: "#ffb23a" },
  { id: "home", slug: "home", name: { en: "Home", ar: "المنزل" }, blurb: { en: "Furniture and light with a sculptural point of view.", ar: "أثاث وإضاءة بروح نحتية." }, image: img("armchair", 1000), accent: "#9b8cff" },
  { id: "beauty", slug: "beauty", name: { en: "Beauty", ar: "جمال" }, blurb: { en: "Considered skincare and colour.", ar: "عناية بالبشرة وألوان مدروسة." }, image: img("serum", 1000), accent: "#ff7fb0" },
  { id: "sports", slug: "sports", name: { en: "Sports", ar: "رياضة" }, blurb: { en: "Training essentials built for repetition.", ar: "أساسيات التمرين المصممة للتكرار." }, image: img("barbell", 1000), accent: "#3affb0" },
];

export const collections: Collection[] = [
  { id: "noir-edit", slug: "noir-edit", name: { en: "The Noir Edit", ar: "إصدار نوار" }, blurb: { en: "Black on black. Texture over colour.", ar: "أسود على أسود. الملمس قبل اللون." }, image: img("hpBrown", 1200), image2: img("teeBlack", 1200) },
  { id: "desk-ritual", slug: "desk-ritual", name: { en: "Desk Ritual", ar: "طقوس المكتب" }, blurb: { en: "Tools and objects for focused work.", ar: "أدوات وأغراض للعمل المركّز." }, image: img("desk", 1200), image2: img("kbWhite", 1200) },
  { id: "weekend-uniform", slug: "weekend-uniform", name: { en: "Weekend Uniform", ar: "زيّ العطلة" }, blurb: { en: "Easy layers and soft shoes for days off.", ar: "طبقات مريحة وأحذية ناعمة لأيام الراحة." }, image: img("layering", 1200), image2: img("sneakerPastel", 1200) },
  { id: "sunday-home", slug: "sunday-home", name: { en: "Sunday Home", ar: "منزل الأحد" }, blurb: { en: "Warm light, deep seats, slow coffee.", ar: "إضاءة دافئة ومقاعد عميقة وقهوة هادئة." }, image: img("sofaTan", 1200), image2: img("candle", 1200) },
];

export const lifestyles: Lifestyle[] = [
  { id: "commuter", name: { en: "The Commuter", ar: "المتنقّل" }, blurb: { en: "Light bags, great audio, zero friction.", ar: "حقائب خفيفة وصوت رائع وبلا عناء." }, image: img("bagPack", 1000) },
  { id: "creator", name: { en: "The Creator", ar: "المبدع" }, blurb: { en: "Tools and textures for makers.", ar: "أدوات وملمس للمبدعين." }, image: img("kbBlue", 1000) },
  { id: "athlete", name: { en: "The Athlete", ar: "الرياضي" }, blurb: { en: "Gear that keeps up.", ar: "معدات تواكب إيقاعك." }, image: img("rope", 1000) },
  { id: "host", name: { en: "The Host", ar: "المضيف" }, blurb: { en: "Pieces that make a room.", ar: "قطع تصنع المكان." }, image: img("armchair", 1000) },
  { id: "traveler", name: { en: "The Traveler", ar: "المسافر" }, blurb: { en: "Carry less, look sharper.", ar: "احمل أقل وتألّق أكثر." }, image: img("bagGreen", 1000) },
];
