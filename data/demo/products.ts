import type { ColorOption, Product, ProductSpec, StockStatus, Variant } from "@/lib/api/types";
import { img, type ImgKey } from "./images";

/**
 * DEMO CATALOG. Every title, description, spec, price, rating and review count here is sample data.
 * Prices are integer minor units (cents).
 */

type L2 = { en: string; ar: string };
const sp = (le: string, la: string, ve: string, va: string): ProductSpec => ({ label: { en: le, ar: la }, value: { en: ve, ar: va } });

const SPECS: Record<string, ProductSpec[]> = {
  apparel: [sp("Fit", "القصّة", "Regular, true to size", "عادية، المقاس مضبوط"), sp("Care", "العناية", "Machine wash cold", "غسيل بارد بالغسالة"), sp("Origin", "المنشأ", "Demo data", "بيانات تجريبية")],
  footwear: [sp("Upper", "الجزء العلوي", "Breathable mesh", "شبك يسمح بالتهوية"), sp("Sole", "النعل", "Cushioned rubber", "مطاط ممتص للصدمات"), sp("Fit", "القصّة", "True to size", "المقاس مضبوط")],
  headphones: [sp("Battery", "البطارية", "Up to 30 hours", "حتى 30 ساعة"), sp("Connection", "الاتصال", "Bluetooth 5.3", "بلوتوث 5.3"), sp("Weight", "الوزن", "255 g", "255 غ")],
  wired: [sp("Cable", "الكابل", "1.5 m detachable", "1.5 م قابل للفصل"), sp("Driver", "المشغّل", "40 mm dynamic", "40 مم ديناميكي"), sp("Weight", "الوزن", "210 g", "210 غ")],
  watch: [sp("Case", "العلبة", "Stainless steel", "ستانلس ستيل"), sp("Water resistance", "مقاومة الماء", "5 ATM", "5 ضغط جوي"), sp("Strap", "السوار", "Replaceable", "قابل للاستبدال")],
  smart: [sp("Battery", "البطارية", "Up to 5 days", "حتى 5 أيام"), sp("Display", "الشاشة", "AMOLED always-on", "AMOLED دائمة التشغيل"), sp("Water resistance", "مقاومة الماء", "5 ATM", "5 ضغط جوي")],
  bag: [sp("Material", "الخامة", "Structured leather-look", "جلد صناعي مدعّم"), sp("Closure", "الإغلاق", "Magnetic / zip", "مغناطيس / سحّاب"), sp("Lining", "البطانة", "Soft textile", "قماش ناعم")],
  pack: [sp("Capacity", "السعة", "22 L", "22 لتر"), sp("Material", "الخامة", "Water-resistant fabric", "قماش مقاوم للماء"), sp("Laptop sleeve", "جيب اللابتوب", "Up to 15 inch", "حتى 15 بوصة")],
  laptop: [sp("Display", "الشاشة", "14 inch, 120 Hz", "14 بوصة، 120 هرتز"), sp("Weight", "الوزن", "1.2 kg", "1.2 كغ"), sp("Ports", "المنافذ", "3 × USB-C", "3 × USB-C")],
  keyboard: [sp("Layout", "التخطيط", "75%", "75%"), sp("Connection", "الاتصال", "USB-C / Bluetooth", "USB-C / بلوتوث"), sp("Backlight", "الإضاءة", "Per-key RGB", "RGB لكل مفتاح")],
  beauty: [sp("Skin type", "نوع البشرة", "All skin types", "جميع أنواع البشرة"), sp("Formula", "التركيبة", "Vegan, fragrance-light", "نباتية، عطر خفيف"), sp("Size", "الحجم", "30 ml", "30 مل")],
  furniture: [sp("Frame", "الهيكل", "Solid hardwood", "خشب صلب"), sp("Assembly", "التركيب", "Light assembly", "تركيب بسيط"), sp("Dimensions", "الأبعاد", "See size guide", "راجع دليل المقاسات")],
  lamp: [sp("Bulb", "المصباح", "E27, warm white", "E27، أبيض دافئ"), sp("Cable", "الكابل", "2 m textile", "2 م قماشي"), sp("Finish", "اللمسة", "Powder-coated", "طلاء بودرة")],
  home: [sp("Material", "الخامة", "Natural materials", "خامات طبيعية"), sp("Care", "العناية", "Wipe clean", "تنظيف بقطعة قماش"), sp("Origin", "المنشأ", "Demo data", "بيانات تجريبية")],
  fitness: [sp("Use", "الاستخدام", "Indoor / outdoor", "داخلي / خارجي"), sp("Material", "الخامة", "Steel & rubber", "فولاذ ومطاط"), sp("Warranty", "الضمان", "Demo data", "بيانات تجريبية")],
  eyewear: [sp("Lens", "العدسة", "UV400 polarised", "UV400 مستقطبة"), sp("Frame", "الإطار", "Acetate", "أسيتات"), sp("Width", "العرض", "145 mm", "145 مم")],
};

const S_APP = ["S", "M", "L", "XL"];
const S_SHOE = ["38", "39", "40", "41", "42", "43", "44", "45"];
const S_JEAN = ["28", "30", "32", "34", "36"];

interface Def {
  slug: string;
  cat: string;
  tags: string[];
  en: string; ar: string; dEn: string; dAr: string;
  price: number; was?: number;
  imgs: ImgKey[];
  colors?: [string, string, string, string, ImgKey?][];
  sizes?: string[]; sizeLabel?: L2; sizePrice?: Record<string, number>;
  spec: keyof typeof SPECS;
  rating?: [number, number];
  date: string;
  feat?: boolean; best?: boolean; badge?: Product["badge"]; soldOut?: boolean;
  col?: string[]; life?: string[];
}

const hash = (s: string) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

function build(d: Def, n: number): Product {
  const colors: ColorOption[] | undefined = d.colors?.map(([id, en, ar, hex]) => ({ id, name: { en, ar }, hex }));
  const sizes = d.sizes;
  const code = d.slug.slice(0, 3).toUpperCase();
  const variants: Variant[] = [];
  const cs: (ColorOption | undefined)[] = colors ?? [undefined];
  const ss: (string | undefined)[] = sizes ?? [undefined];
  cs.forEach((c) =>
    ss.forEach((s, si) => {
      const h = hash(`${d.slug}${c?.id}${s}`);
      // A few size/colour combinations are not produced at all ("invalid combinations").
      if (sizes && sizes.length > 4 && c && si > 0 && h % 17 === 0) return;
      let stock = d.soldOut ? 0 : h % 6 === 0 ? 0 : h % 5 === 0 ? 2 : 6 + (h % 20);
      if (!d.soldOut && si === 0 && stock === 0) stock = 9;
      const price = s && d.sizePrice?.[s] !== undefined ? d.sizePrice[s] * 100 : undefined;
      variants.push({
        id: `${d.slug}-${[c?.id, s].filter(Boolean).join("-") || "std"}`,
        sku: `VNT-${code}${String(n).padStart(2, "0")}-${[c?.id.slice(0, 3).toUpperCase(), s].filter(Boolean).join("-") || "STD"}`,
        color: c?.id, size: s, price, stock,
      });
    }),
  );
  const total = variants.reduce((a, v) => a + v.stock, 0);
  const stockStatus: StockStatus = total === 0 ? "out_of_stock" : total <= 6 ? "low_stock" : "in_stock";

  const colorOfImg = (k: ImgKey) => d.colors?.find((c) => c[4] === k);
  const images = d.imgs.map((k, i) => {
    const c = colorOfImg(k);
    return { src: img(k), alt: c ? { en: `${d.en} in ${c[1]}`, ar: `${d.ar} بلون ${c[2]}` } : { en: `${d.en} — view ${i + 1}`, ar: `${d.ar} — منظر ${i + 1}` } };
  });
  d.colors?.forEach(([, en, ar, , k]) => {
    if (k && !d.imgs.includes(k)) images.push({ src: img(k), alt: { en: `${d.en} in ${en}`, ar: `${d.ar} بلون ${ar}` } });
  });
  const tagged = images.map((im, i) => {
    const color = d.colors?.find((c) => c[4] && img(c[4]) === im.src)?.[0];
    return color ? { ...im, color } : { ...im, color: i === 0 && d.colors ? d.colors[0][0] : undefined };
  });
  // The first colour's image leads the gallery.
  const rating = d.rating;
  return {
    id: `p${String(n).padStart(2, "0")}`,
    slug: d.slug,
    title: { en: d.en, ar: d.ar },
    description: { en: d.dEn, ar: d.dAr },
    categoryId: d.cat, tags: d.tags,
    price: d.price * 100, compareAtPrice: d.was ? d.was * 100 : undefined, currency: "USD",
    images: tagged.map((i) => (i.color ? i : { src: i.src, alt: i.alt })),
    colors, sizes, sizeLabel: d.sizeLabel ?? (sizes ? { en: "Size", ar: "المقاس" } : undefined),
    variants, stockStatus,
    rating: rating?.[0], reviewCount: rating?.[1],
    featured: !!d.feat, bestSeller: !!d.best,
    badge: d.badge ?? (d.was ? "sale" : undefined),
    specs: SPECS[d.spec], createdAt: d.date,
    collectionIds: d.col ?? [], lifestyleIds: d.life ?? [],
  };
}

const defs: Def[] = [
  // ───────── Fashion
  { slug: "atelier-moto-jacket", cat: "fashion", tags: ["jackets"], en: "Atelier Moto Jacket", ar: "جاكيت موتو أتيليه", dEn: "A sharp, cropped biker silhouette in supple vegan leather with matte hardware.", dAr: "قصّة بايكر قصيرة وحادة من جلد نباتي مرن مع إكسسوارات مطفية.", price: 289, was: 349, imgs: ["jacket", "rack"], sizes: S_APP, spec: "apparel", rating: [4.7, 86], date: "2026-04-12", feat: true, col: ["noir-edit"] },
  { slug: "essential-heavy-tee", cat: "fashion", tags: ["tops"], en: "Essential Heavy Tee", ar: "تيشيرت أساسي ثقيل", dEn: "A 260 gsm cotton tee with a boxy drape that holds its shape wash after wash.", dAr: "تيشيرت قطني 260 غرام بقصّة واسعة تحافظ على شكلها بعد كل غسلة.", price: 48, imgs: ["teeWhite", "teeBlack2"], colors: [["white", "Chalk", "طباشيري", "#f1efe8", "teeWhite"], ["black", "Onyx", "أونيكس", "#16161a", "teeBlack"]], sizes: S_APP, spec: "apparel", rating: [4.8, 412], date: "2026-02-03", best: true, col: ["noir-edit"], life: ["traveler"] },
  { slug: "cream-knit-poncho", cat: "fashion", tags: ["knitwear"], en: "Cream Knit Poncho", ar: "بونشو تريكو كريمي", dEn: "Open-knit and fringed, an easy layer for cool evenings.", dAr: "تريكو مفتوح بأطراف مهدّبة، طبقة مريحة لأمسيات باردة.", price: 96, imgs: ["poncho"], sizes: ["One size"], sizeLabel: { en: "Fit", ar: "القصّة" }, spec: "apparel", rating: [4.4, 38], date: "2026-07-21", col: ["weekend-uniform"] },
  { slug: "chambray-work-shirt", cat: "fashion", tags: ["shirts"], en: "Chambray Work Shirt", ar: "قميص شامبراي للعمل", dEn: "Soft washed chambray with a relaxed collar. Wear it open over a tee.", dAr: "شامبراي مغسول ناعم بياقة مريحة. ارتديه مفتوحاً فوق تيشيرت.", price: 84, imgs: ["shirt"], sizes: S_APP, spec: "apparel", rating: [4.5, 61], date: "2026-05-09", col: ["weekend-uniform"] },
  { slug: "scarlet-evening-gown", cat: "fashion", tags: ["dresses"], en: "Scarlet Evening Gown", ar: "فستان سهرة قرمزي", dEn: "A fluid full-length gown in saturated red that moves with you.", dAr: "فستان طويل منسدل بلون أحمر مشبع يتحرك معك.", price: 420, imgs: ["gown"], sizes: ["XS", "S", "M", "L"], spec: "apparel", rating: [4.9, 24], date: "2026-09-18", badge: "limited", feat: true },
  { slug: "autumn-layering-set", cat: "fashion", tags: ["sets"], en: "Autumn Layering Set", ar: "طقم طبقات الخريف", dEn: "Beanie, knit and denim styled as a ready-made weekend outfit.", dAr: "قبعة وتريكو وجينز منسّقة كإطلالة جاهزة لعطلة الأسبوع.", price: 215, imgs: ["layering"], sizes: S_APP, spec: "apparel", rating: [4.6, 45], date: "2026-10-02", badge: "new", col: ["weekend-uniform"] },
  { slug: "distressed-straight-denim", cat: "fashion", tags: ["denim"], en: "Distressed Straight Denim", ar: "جينز مستقيم مهترئ", dEn: "Rigid denim with hand-finished distressing and a straight leg.", dAr: "جينز متين بتهرئة يدوية وساق مستقيمة.", price: 128, imgs: ["jeans"], sizes: S_JEAN, sizeLabel: { en: "Waist", ar: "الخصر" }, spec: "apparel", rating: [4.3, 77], date: "2026-03-14", col: ["weekend-uniform"] },
  { slug: "sage-tee-three-pack", cat: "fashion", tags: ["tops"], en: "Sage Tee Three-Pack", ar: "ثلاثة تيشيرتات بلون المريمية", dEn: "Three everyday tees in a muted sage, folded and ready to wear.", dAr: "ثلاثة تيشيرتات يومية بلون مريمية هادئ، جاهزة للارتداء.", price: 79, was: 99, imgs: ["sage", "rack2"], sizes: S_APP, spec: "apparel", rating: [4.6, 133], date: "2026-06-05", col: ["weekend-uniform"] },
  { slug: "court-low-sneaker", cat: "fashion", tags: ["sneakers"], en: "Court Low Sneaker", ar: "حذاء كورت منخفض", dEn: "A clean low-top with a cushioned footbed. Three colourways, each with its own photography.", dAr: "حذاء منخفض أنيق بنعل مريح. ثلاثة ألوان لكل منها صور خاصة.", price: 139, imgs: ["sneakerPastel", "sneakerMaroon", "sneakerBlack"], colors: [["pastel", "Pastel", "باستيل", "#f3c9d8", "sneakerPastel"], ["burgundy", "Burgundy", "عنابي", "#6e1a2a", "sneakerMaroon"], ["noir", "Noir", "أسود", "#18181b", "sneakerBlack"]], sizes: S_SHOE, sizeLabel: { en: "Size (EU)", ar: "المقاس (EU)" }, spec: "footwear", rating: [4.7, 268], date: "2026-08-24", feat: true, best: true, badge: "new", col: ["noir-edit", "weekend-uniform"] },
  { slug: "ember-trail-runner", cat: "sports", tags: ["sneakers", "running"], en: "Ember Trail Runner", ar: "حذاء إمبر للجري", dEn: "A grippy trail runner with a rocker sole and bold colour blocking.", dAr: "حذاء جري بنعل ثابت وتدرّج ألوان جريء للمسارات الوعرة.", price: 165, imgs: ["sneakerMulti"], sizes: S_SHOE, sizeLabel: { en: "Size (EU)", ar: "المقاس (EU)" }, spec: "footwear", rating: [4.5, 102], date: "2026-09-29", badge: "new", col: ["weekend-uniform"], life: ["athlete"] },
  // ───────── Accessories
  { slug: "marina-top-handle-bag", cat: "accessories", tags: ["bags"], en: "Marina Top-Handle Bag", ar: "حقيبة مارينا بمقبض علوي", dEn: "A structured teal top-handle with a polished clasp and roomy interior.", dAr: "حقيبة مبنية بلون تيل مع إبزيم لامع ومساحة واسعة.", price: 310, imgs: ["bagTeal"], spec: "bag", rating: [4.6, 52], date: "2026-06-30" },
  { slug: "scarlet-lock-satchel", cat: "accessories", tags: ["bags"], en: "Scarlet Lock Satchel", ar: "حقيبة سكارلت بقفل", dEn: "Statement red satchel with a turn-lock and gleaming hardware.", dAr: "حقيبة حمراء لافتة بقفل دوّار وإكسسوارات لامعة.", price: 360, was: 420, imgs: ["bagRed"], spec: "bag", rating: [4.8, 91], date: "2026-03-28", feat: true },
  { slug: "sol-wicker-handbag", cat: "accessories", tags: ["bags"], en: "Sol Wicker Handbag", ar: "حقيبة سول من الخيزران", dEn: "Hand-woven wicker with a smooth top flap. Made for long summers.", dAr: "خيزران منسوج يدوياً مع غطاء علوي ناعم. صُنعت لصيف طويل.", price: 198, imgs: ["bagWicker"], spec: "bag", rating: [4.4, 33], date: "2026-05-18", life: ["traveler"] },
  { slug: "daily-commuter-pack", cat: "accessories", tags: ["bags", "backpacks"], en: "Daily Commuter Pack", ar: "حقيبة ظهر للتنقل اليومي", dEn: "A slim navy backpack with a padded laptop sleeve and hidden pockets.", dAr: "حقيبة ظهر نحيفة كحلية مع جيب مبطّن للابتوب وجيوب مخفية.", price: 145, imgs: ["bagPack"], spec: "pack", rating: [4.7, 214], date: "2026-04-02", best: true, life: ["commuter"] },
  { slug: "summit-roll-top-pack", cat: "accessories", tags: ["bags", "backpacks"], en: "Summit Roll-Top Pack", ar: "حقيبة سَميت قابلة للطي", dEn: "A roll-top pack in weathered green canvas with leather trim.", dAr: "حقيبة بغطاء قابل للطي من قماش أخضر مع حواف جلدية.", price: 169, imgs: ["bagGreen"], spec: "pack", rating: [4.6, 70], date: "2026-07-07", life: ["traveler"] },
  { slug: "meridian-dress-watch", cat: "accessories", tags: ["watches"], en: "Meridian Dress Watch", ar: "ساعة ميريديان الرسمية", dEn: "A slim steel case, white dial and slate-blue strap for everyday formal.", dAr: "علبة فولاذية رفيعة وميناء أبيض وسوار أزرق رمادي للإطلالات الرسمية.", price: 480, imgs: ["watchBlue"], spec: "watch", rating: [4.8, 59], date: "2026-02-20", life: ["commuter"] },
  { slug: "abyss-diver-300", cat: "accessories", tags: ["watches"], en: "Abyss Diver 300", ar: "ساعة أبيس للغوص 300", dEn: "A 300 m dive watch with a ceramic bezel and luminous markers.", dAr: "ساعة غوص حتى 300 متر بإطار سيراميك وعلامات مضيئة.", price: 620, was: 740, imgs: ["watchDiver"], spec: "watch", rating: [4.9, 47], date: "2026-03-30", feat: true, life: ["athlete"] },
  { slug: "linea-minimal-watch", cat: "accessories", tags: ["watches"], en: "Linea Minimal Watch", ar: "ساعة لينيا البسيطة", dEn: "Quiet, slim and dressy. A thin rose-gold case on a soft leather strap.", dAr: "هادئة ورفيعة وأنيقة. علبة ذهبية وردية على سوار جلدي ناعم.", price: 240, imgs: ["watchMinimal"], spec: "watch", rating: [4.5, 66], date: "2026-08-11", life: ["traveler"] },
  { slug: "noir-wayfarer-sunglasses", cat: "accessories", tags: ["eyewear"], en: "Noir Wayfarer Sunglasses", ar: "نظارة شمسية نوار واي فيرر", dEn: "Classic wayfarer shape in glossy black with polarised lenses.", dAr: "شكل واي فيرر كلاسيكي بأسود لامع وعدسات مستقطبة.", price: 149, imgs: ["sunglasses"], spec: "eyewear", rating: [4.6, 118], date: "2026-05-26", col: ["noir-edit"], life: ["traveler"] },
  // ───────── Electronics
  { slug: "studio-pro-anc-headphones", cat: "electronics", tags: ["headphones"], en: "Studio Pro ANC Headphones", ar: "سماعات ستوديو برو بخاصية إلغاء الضجيج", dEn: "Adaptive noise cancelling with a warm, balanced signature and 30 hours of battery.", dAr: "إلغاء ضجيج تكيّفي بصوت دافئ متوازن وبطارية 30 ساعة.", price: 349, imgs: ["hpYellow"], spec: "headphones", rating: [4.8, 530], date: "2026-04-22", feat: true, best: true, col: ["desk-ritual"], life: ["commuter"] },
  { slug: "monitor-one-wired", cat: "electronics", tags: ["headphones"], en: "Monitor One Wired Headphones", ar: "سماعات مونيتور وان السلكية", dEn: "Studio-flat response and a detachable cable for mixing and editing.", dAr: "استجابة مسطّحة للاستوديو وكابل قابل للفصل للمكساج والتحرير.", price: 129, imgs: ["hpWired"], spec: "wired", rating: [4.4, 88], date: "2026-03-05", life: ["creator"] },
  { slug: "halo-over-ear-wireless", cat: "electronics", tags: ["headphones"], en: "Halo Over-Ear Wireless", ar: "سماعات هالو لاسلكية", dEn: "Plush memory-foam cups and multipoint Bluetooth for all-day wear.", dAr: "وسائد إسفنجية مريحة وبلوتوث متعدد الأجهزة للارتداء طوال اليوم.", price: 279, imgs: ["hpDark"], spec: "headphones", rating: [4.6, 301], date: "2026-05-01", best: true, col: ["noir-edit"], life: ["commuter"] },
  { slug: "heritage-on-ear", cat: "electronics", tags: ["headphones"], en: "Heritage On-Ear", ar: "سماعات هيريتدج على الأذن", dEn: "Retro on-ears with brushed metal and tan leatherette pads.", dAr: "سماعات كلاسيكية بمعدن مصقول ووسائد جلدية بنية.", price: 159, imgs: ["hpRetro"], spec: "wired", rating: [4.5, 74], date: "2026-01-17", soldOut: true },
  { slug: "nimbus-noise-cancelling", cat: "electronics", tags: ["headphones"], en: "Nimbus Noise-Cancelling", ar: "سماعات نيمبوس لإلغاء الضجيج", dEn: "Our quietest over-ear yet, with a 40-hour battery and spatial mode.", dAr: "أهدأ سماعاتنا حتى الآن بعمر بطارية 40 ساعة ووضع صوت مكاني.", price: 399, imgs: ["hpBrown"], spec: "headphones", rating: [4.9, 62], date: "2026-10-12", badge: "new", feat: true, col: ["noir-edit"] },
  { slug: "pulse-smartwatch", cat: "electronics", tags: ["watches", "wearables"], en: "Pulse Smartwatch", ar: "ساعة بولس الذكية", dEn: "Bright always-on display, sleep tracking and five-day battery in two sizes.", dAr: "شاشة ساطعة دائمة وتتبع للنوم وبطارية خمسة أيام بمقاسين.", price: 329, imgs: ["watchSmart"], sizes: ["41 mm", "45 mm"], sizeLabel: { en: "Case size", ar: "حجم العلبة" }, sizePrice: { "45 mm": 359 }, spec: "smart", rating: [4.7, 189], date: "2026-10-05", badge: "new", col: ["noir-edit"], life: ["commuter"] },
  { slug: "halo-smartband", cat: "electronics", tags: ["wearables"], en: "Halo Smartband", ar: "سوار هالو الذكي", dEn: "A featherlight fitness band with a white silicone strap.", dAr: "سوار رياضي خفيف جداً بحزام سيليكون أبيض.", price: 119, imgs: ["watchBand"], spec: "smart", rating: [4.2, 95], date: "2026-06-14", life: ["athlete"] },
  { slug: "ledger-14-laptop", cat: "electronics", tags: ["laptops"], en: "Ledger 14 Laptop", ar: "لابتوب ليدجر 14", dEn: "A 1.2 kg aluminium laptop with a 120 Hz display. Choose your storage.", dAr: "لابتوب ألمنيوم بوزن 1.2 كغ وشاشة 120 هرتز. اختر سعة التخزين.", price: 1490, imgs: ["laptop"], sizes: ["512 GB", "1 TB"], sizeLabel: { en: "Storage", ar: "التخزين" }, sizePrice: { "1 TB": 1790 }, spec: "laptop", rating: [4.7, 143], date: "2026-09-02", col: ["desk-ritual"], life: ["creator"] },
  { slug: "carry-all-tech-kit", cat: "electronics", tags: ["accessories"], en: "Carry-All Tech Kit", ar: "حقيبة التقنية الشاملة", dEn: "Watch, buds and charger flat-laid in a travel-friendly organiser.", dAr: "ساعة وسماعات وشاحن في منظّم مناسب للسفر.", price: 219, was: 259, imgs: ["desk"], spec: "home", rating: [4.3, 29], date: "2026-07-30", col: ["desk-ritual"], life: ["creator"] },
  { slug: "pulse-mechanical-keyboard", cat: "electronics", tags: ["keyboards"], en: "Pulse Mechanical Keyboard", ar: "كيبورد بولس الميكانيكي", dEn: "Hot-swappable switches, per-key backlight and a satisfying thock.", dAr: "مفاتيح قابلة للتبديل وإضاءة لكل مفتاح وصوت نقر مُرضٍ.", price: 159, imgs: ["kbBlue"], spec: "keyboard", rating: [4.7, 247], date: "2026-08-02", best: true, col: ["desk-ritual"], life: ["creator"] },
  { slug: "slate-wireless-keyboard", cat: "electronics", tags: ["keyboards"], en: "Slate Wireless Keyboard", ar: "كيبورد سليت اللاسلكي", dEn: "A low-profile white keyboard that pairs with three devices.", dAr: "كيبورد أبيض منخفض الارتفاع يقترن بثلاثة أجهزة.", price: 99, imgs: ["kbWhite"], spec: "keyboard", rating: [4.4, 119], date: "2026-04-16", col: ["desk-ritual"], life: ["creator"] },
  // ───────── Beauty
  { slug: "glow-brush-blush-set", cat: "beauty", tags: ["makeup"], en: "Glow Brush & Blush Set", ar: "طقم فرش وبلاشر للإشراقة", dEn: "Soft rose brushes with a buildable blush and highlighter.", dAr: "فرش وردية ناعمة مع بلاشر وهايلايتر قابلين للتدرج.", price: 68, imgs: ["brushes"], spec: "beauty", rating: [4.5, 156], date: "2026-07-12" },
  { slug: "botanical-dropper-serum", cat: "beauty", tags: ["skincare"], en: "Botanical Dropper Serum", ar: "سيروم نباتي بالقطّارة", dEn: "A light daily serum in an amber glass dropper bottle.", dAr: "سيروم يومي خفيف في زجاجة عنبرية بقطّارة.", price: 54, imgs: ["serum"], spec: "beauty", rating: [4.8, 322], date: "2026-02-28", best: true, feat: true },
  { slug: "ritual-skincare-set", cat: "beauty", tags: ["skincare"], en: "Ritual Skincare Set", ar: "طقم الطقوس للعناية بالبشرة", dEn: "Cleanser, toner and oil styled in a botanical flat-lay.", dAr: "منظّف وتونر وزيت ضمن تنسيق نباتي.", price: 112, was: 135, imgs: ["skincare"], spec: "beauty", rating: [4.6, 98], date: "2026-05-08" },
  { slug: "garden-makeup-kit", cat: "beauty", tags: ["makeup"], en: "Garden Makeup Kit", ar: "طقم المكياج الحديقة", dEn: "Lip, brow and complexion essentials in one gift-ready kit.", dAr: "أساسيات الشفاه والحواجب والبشرة في طقم جاهز للإهداء.", price: 89, imgs: ["makeup"], spec: "beauty", rating: [4.4, 64], date: "2026-09-08", badge: "new" },
  // ───────── Home
  { slug: "verde-three-seat-sofa", cat: "home", tags: ["furniture", "sofas"], en: "Verde Three-Seat Sofa", ar: "كنبة فيردي بثلاثة مقاعد", dEn: "A deep, low sofa with sculpted arms. Three upholstery colours, each photographed.", dAr: "كنبة عميقة ومنخفضة بمساند منحوتة. ثلاثة ألوان تنجيد لكل منها صور.", price: 1290, imgs: ["sofaGrey", "sofaTan", "sofaGreen"], colors: [["stone", "Stone", "رمادي حجري", "#9a9a9a", "sofaGrey"], ["terra", "Terra", "تيرا", "#a8794f", "sofaTan"], ["emerald", "Emerald", "زمردي", "#1c5a48", "sofaGreen"]], spec: "furniture", rating: [4.7, 41], date: "2026-08-15", feat: true, col: ["sunday-home"], life: ["host"] },
  { slug: "sol-accent-armchair", cat: "home", tags: ["furniture", "chairs"], en: "Sol Accent Armchair", ar: "كرسي سول للزينة", dEn: "A sunny accent chair on tapered legs that lifts a quiet corner.", dAr: "كرسي بلون مشرق على أرجل مدبّبة يضيء ركناً هادئاً.", price: 540, imgs: ["armchair"], spec: "furniture", rating: [4.6, 33], date: "2026-06-22", col: ["sunday-home"], life: ["host"] },
  { slug: "teal-pendant-lamp", cat: "home", tags: ["lighting"], en: "Teal Pendant Lamp", ar: "مصباح معلّق تيل", dEn: "A classic dome pendant with a soft, even downlight.", dAr: "مصباح معلّق كلاسيكي بقبة وإضاءة ناعمة متوازنة.", price: 120, imgs: ["pendant"], spec: "lamp", rating: [4.3, 57], date: "2026-03-19", col: ["sunday-home"], life: ["host"] },
  { slug: "nordic-oak-stool", cat: "home", tags: ["furniture"], en: "Nordic Oak Stool", ar: "ستول نوردي من البلوط", dEn: "A solid oak stool that works as seating, side table or plant stand.", dAr: "ستول من البلوط الصلب يصلح كمقعد أو طاولة جانبية أو حامل نباتات.", price: 85, imgs: ["stool"], spec: "furniture", rating: [4.5, 72], date: "2026-01-29", col: ["sunday-home"], life: ["host"] },
  { slug: "studio-floor-lamp", cat: "home", tags: ["lighting"], en: "Studio Floor Lamp", ar: "مصباح أرضي ستوديو", dEn: "A weighted, adjustable-head floor lamp in matte graphite.", dAr: "مصباح أرضي بقاعدة ثقيلة ورأس قابل للتعديل بلون جرافيت مطفي.", price: 175, imgs: ["floorLamp"], spec: "lamp", rating: [4.6, 51], date: "2026-04-27", col: ["desk-ritual"] },
  { slug: "ash-lounge-chair", cat: "home", tags: ["furniture", "chairs"], en: "Ash Lounge Chair", ar: "كرسي آش للاسترخاء", dEn: "A softly upholstered lounge chair with a solid ash frame.", dAr: "كرسي استرخاء منجّد بنعومة بهيكل من خشب الدردار.", price: 460, imgs: ["chair"], spec: "furniture", rating: [4.4, 28], date: "2026-07-03", col: ["sunday-home"], life: ["host"] },
  // ───────── Lifestyle
  { slug: "adventure-enamel-mug", cat: "lifestyle", tags: ["drinkware"], en: "Adventure Enamel Mug", ar: "كوب المغامرة المطلي", dEn: "A tough enamel mug for campfires, desks and slow mornings.", dAr: "كوب مطلي متين لمواقد التخييم والمكاتب والصباحات الهادئة.", price: 22, imgs: ["mug"], spec: "home", rating: [4.7, 389], date: "2026-02-12", col: ["desk-ritual"], life: ["host"] },
  { slug: "single-origin-coffee-250g", cat: "lifestyle", tags: ["coffee"], en: "Single-Origin Coffee 250 g", ar: "قهوة أحادية المصدر 250 غ", dEn: "A medium roast with notes of cocoa and orange peel.", dAr: "تحميص متوسط بنكهات الكاكاو وقشر البرتقال.", price: 18, imgs: ["coffee"], spec: "home", rating: [4.6, 204], date: "2026-03-01", best: true, col: ["desk-ritual", "sunday-home"], life: ["host"] },
  { slug: "amber-glass-candle", cat: "lifestyle", tags: ["candles"], en: "Amber Glass Candle", ar: "شمعة الزجاج العنبري", dEn: "A hand-poured candle with a slow, even burn and warm woody notes.", dAr: "شمعة مصبوبة يدوياً باحتراق بطيء متوازن وروائح خشبية دافئة.", price: 38, imgs: ["candle"], spec: "home", rating: [4.8, 276], date: "2026-04-08", best: true, col: ["sunday-home"], life: ["host"] },
  { slug: "canvas-market-tote", cat: "lifestyle", tags: ["bags"], en: "Canvas Market Tote", ar: "حقيبة التسوق القماشية", dEn: "A sturdy natural canvas tote that folds flat for the week's shop.", dAr: "حقيبة قماشية طبيعية متينة تُطوى لتسوق الأسبوع.", price: 42, imgs: ["tote"], spec: "bag", rating: [4.5, 142], date: "2026-05-30", col: ["weekend-uniform"], life: ["commuter"] },
  // ───────── Sports
  { slug: "iron-barbell-training-kit", cat: "sports", tags: ["strength"], en: "Iron Barbell Training Kit", ar: "طقم الحديد للتمارين", dEn: "A barbell, collars and bumper plates for a serious home rack.", dAr: "قضيب حديد وأقفال وأقراص مطاطية لركن تمرين منزلي جاد.", price: 260, imgs: ["barbell", "gym"], spec: "fitness", rating: [4.7, 58], date: "2026-06-09", life: ["athlete"] },
  { slug: "heavy-battle-rope-15m", cat: "sports", tags: ["conditioning"], en: "Heavy Battle Rope 15 m", ar: "حبل المعركة الثقيل 15 م", dEn: "A 15 m conditioning rope with protective sleeves on both ends.", dAr: "حبل تكييف بطول 15 م مع أغطية حماية على الطرفين.", price: 79, was: 99, imgs: ["rope"], spec: "fitness", rating: [4.6, 87], date: "2026-07-25", life: ["athlete"] },
];

export const products: Product[] = defs.map((d, i) => build(d, i + 1));
