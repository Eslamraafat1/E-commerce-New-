import type { Article } from "@/lib/api/types";
import { img } from "./images";

/** Sample editorial content for the demo journal. Not real advice, reviews or press. */
export const articles: Article[] = [
  {
    slug: "how-to-choose-noise-cancelling-headphones",
    title: { en: "How to choose noise-cancelling headphones", ar: "كيف تختار سماعات إلغاء الضجيج" },
    excerpt: { en: "Comfort, codec, battery: three questions to ask before you buy.", ar: "الراحة والترميز والبطارية: ثلاثة أسئلة قبل الشراء." },
    category: { en: "Buying guide", ar: "دليل الشراء" },
    image: img("hpYellow", 1400), date: "2026-09-14", readMinutes: 5,
    body: [
      { en: "Start with comfort. A headphone you forget you are wearing will be the one you actually use, so weight, clamp force and pad depth matter more than any spec sheet number.", ar: "ابدأ بالراحة. السماعة التي تنسى أنك ترتديها هي التي ستستخدمها فعلاً، لذا الوزن وقوة الضغط وعمق الوسادة أهم من أي رقم في المواصفات." },
      { en: "Next, think about where you listen. Commutes reward strong active noise cancelling; quiet offices reward a lighter, more natural sound.", ar: "ثم فكّر في مكان الاستماع. التنقل يحتاج إلغاء ضجيج قوياً، والمكاتب الهادئة تحتاج صوتاً أخف وأكثر طبيعية." },
      { en: "Finally, check battery and multipoint pairing, so one pair can follow you from laptop to phone without fuss.", ar: "وأخيراً تحقق من البطارية والاقتران المتعدد حتى تنتقل السماعة بين اللابتوب والهاتف بسهولة." },
    ],
  },
  {
    slug: "building-a-capsule-wardrobe",
    title: { en: "Building a capsule wardrobe in five pieces", ar: "بناء خزانة كبسولة من خمس قطع" },
    excerpt: { en: "A heavy tee, a jacket, denim, a low sneaker and one statement bag.", ar: "تيشيرت ثقيل وجاكيت وجينز وحذاء منخفض وحقيبة واحدة لافتة." },
    category: { en: "Style", ar: "أسلوب" },
    image: img("rack", 1400), date: "2026-08-30", readMinutes: 4,
    body: [
      { en: "A capsule wardrobe is less about owning less and more about owning pieces that all work together.", ar: "الخزانة الكبسولة ليست امتلاك القليل بل امتلاك قطع تتناغم معاً." },
      { en: "Choose a palette of three colours, then pick fabrics with some texture. Texture does the work that colour would otherwise do.", ar: "اختر لوحة من ثلاثة ألوان ثم أقمشة ذات ملمس. الملمس يؤدي دور اللون." },
    ],
  },
  {
    slug: "the-sunday-home-edit",
    title: { en: "The Sunday Home edit: light, seats, slow coffee", ar: "إصدار منزل الأحد: الضوء والمقاعد والقهوة" },
    excerpt: { en: "Three ideas for making a living room feel like a retreat.", ar: "ثلاث أفكار لجعل غرفة المعيشة ملاذاً." },
    category: { en: "Home", ar: "المنزل" },
    image: img("sofaTan", 1400), date: "2026-10-01", readMinutes: 6,
    body: [
      { en: "Layer your lighting. One overhead source is rarely flattering, so add a floor lamp and a low candle.", ar: "اجعل الإضاءة طبقات. مصدر علوي واحد نادراً ما يكون جميلاً، فأضف مصباحاً أرضياً وشمعة منخفضة." },
      { en: "Pick one deep seat to anchor the room, and let everything else stay light.", ar: "اختر مقعداً عميقاً واحداً ليثبّت الغرفة، واترك الباقي خفيفاً." },
    ],
  },
  {
    slug: "desk-setup-for-focus",
    title: { en: "A desk setup that helps you focus", ar: "مكتب يساعدك على التركيز" },
    excerpt: { en: "Keyboard feel, lighting and cable calm: small upgrades with a big effect.", ar: "ملمس الكيبورد والإضاءة وترتيب الكابلات: تحسينات صغيرة بأثر كبير." },
    category: { en: "Workspace", ar: "مساحة العمل" },
    image: img("kbBlue", 1400), date: "2026-07-19", readMinutes: 4,
    body: [
      { en: "Your keyboard is the part of your desk you touch the most. Choose it for feel first, features second.", ar: "الكيبورد هو أكثر ما تلمسه في مكتبك. اخترْه لملمسه أولاً ثم لميزاته." },
      { en: "Place a warm lamp to the side of your screen to reduce glare and eye strain.", ar: "ضع مصباحاً دافئاً بجانب الشاشة لتقليل الوهج وإجهاد العين." },
    ],
  },
  {
    slug: "skincare-routine-basics",
    title: { en: "Skincare routine basics, simplified", ar: "أساسيات روتين العناية بالبشرة ببساطة" },
    excerpt: { en: "Cleanse, treat, protect: the three steps that matter.", ar: "نظّف وعالج واحمِ: ثلاث خطوات أساسية." },
    category: { en: "Beauty", ar: "جمال" },
    image: img("skincare", 1400), date: "2026-06-11", readMinutes: 3,
    body: [
      { en: "Keep it simple. A gentle cleanser, one treatment serum and daily sun protection cover most needs.", ar: "اجعلها بسيطة. منظّف لطيف وسيروم علاجي وواقٍ شمسي يومي يغطي معظم الاحتياجات." },
    ],
  },
];

/** Clearly identified sample testimonials. */
export const testimonials = [
  { id: "t1", name: { en: "Sample customer A", ar: "عميل تجريبي أ" }, text: { en: "The headphones are comfortable all day and the checkout was effortless.", ar: "السماعات مريحة طوال اليوم وعملية الدفع كانت سهلة." }, product: { en: "Studio Pro ANC", ar: "ستوديو برو" } },
  { id: "t2", name: { en: "Sample customer B", ar: "عميل تجريبي ب" }, text: { en: "Great quality and the colour matched the photos.", ar: "جودة رائعة واللون مطابق للصور." }, product: { en: "Court Low Sneaker", ar: "حذاء كورت" } },
  { id: "t3", name: { en: "Sample customer C", ar: "عميل تجريبي ج" }, text: { en: "The sofa transformed our living room.", ar: "الكنبة غيّرت غرفة المعيشة تماماً." }, product: { en: "Verde Sofa", ar: "كنبة فيردي" } },
];
