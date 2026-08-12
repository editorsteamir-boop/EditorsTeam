import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const specialConfig = JSON.parse(await readFile(path.join(root, "scripts/fonto-special-styles.json"), "utf8"));

const palettes = [
  { key: "sunset", title: "غروب", text: "#ffffff" },
  { key: "aqua", title: "آبی", text: "#ffffff" },
  { key: "mint", title: "نعنایی", text: "#06281e" },
  { key: "berry", title: "بری", text: "#ffffff" },
  { key: "gold", title: "طلایی", text: "#201500" },
  { key: "sky", title: "آسمانی", text: "#ffffff" },
];

const quickKinds = [
  { key: "pill", title: "کپسول گرادیانی", category: "instagram" },
  { key: "glass", title: "شیشه‌ای نرم", category: "glass" },
  { key: "neon", title: "قاب نئون", category: "neon" },
  { key: "bubble", title: "حباب مدرن", category: "instagram" },
  { key: "layered", title: "لایه‌ای سه‌بعدی", category: "instagram" },
];

const quickStyles = [];
let quickOrder = 1;
for (const palette of palettes) {
  for (const kind of quickKinds) {
    const order = quickOrder++;
    quickStyles.push({
      slug: `quick-${String(order).padStart(2, "0")}`,
      title: `${palette.title} — ${kind.title}`,
      category: kind.category,
      asset_url: `library-v2-e8c1d4f7/quick/trend-${String(order).padStart(2, "0")}-${palette.key}-${kind.key}.png`,
      preview_url: `library-v2-e8c1d4f7/quick/trend-${String(order).padStart(2, "0")}-${palette.key}-${kind.key}.png`,
      text_color: palette.text,
      is_active: true,
      sort_order: order,
    });
  }
}

let specialIndex = 0;
for (const palette of specialConfig.palettes) {
  for (const variant of specialConfig.variants) {
    specialIndex += 1;
    const order = quickOrder++;
    const file = `special-${String(specialIndex).padStart(2, "0")}-${palette.key}-${variant.key}.png`;
    quickStyles.push({
      slug: `special-${String(specialIndex).padStart(2, "0")}`,
      title: `${palette.title} — ${variant.title}`,
      category: "special",
      asset_url: `${specialConfig.asset_folder}/${file}`,
      preview_url: `${specialConfig.asset_folder}/${file}`,
      text_color: palette.text,
      is_active: true,
      sort_order: order,
    });
  }
}

const stop = (at, color) => ({ at, color });
const outline = (color, width) => ({ color, width });
const shadow = (color, blur, x = 0, y = 0) => ({ color, blur, x, y });

let themeOrder = 0;

function makeTheme(slug, titleFa, titleEn, category, preview, effects) {
  return {
    slug,
    title_fa: titleFa,
    title_en: titleEn,
    category,
    preview_text_fa: "نمونه فارسی",
    preview_text_en: "English Style",
    supports_fa: true,
    supports_en: true,
    is_active: true,
    sort_order: ++themeOrder,
    effects_json: {
      font_weight: 900,
      opacity: 1,
      preview_bg_a: preview[0],
      preview_bg_b: preview[1],
      ...effects,
    },
  };
}

const textThemes = [];

// Trend themes — bright, social-first combinations.
textThemes.push(
  makeTheme("aurora-pop", "پاپ شفق", "Aurora Pop", "trend", ["#09152f", "#24105d"], {
    fill_stops: [stop(0, "#5efce8"), stop(.5, "#b56cff"), stop(1, "#ff4fb3")],
    gradient_direction: "diagonal",
    outlines: [outline("#ffffff", 2)],
    shadows: [shadow("#4c1d95", 14, 0, 5)],
  }),
  makeTheme("sunset-viral", "غروب وایرال", "Sunset Viral", "trend", ["#251136", "#60103f"], {
    fill_stops: [stop(0, "#ffe66d"), stop(.48, "#ff7a59"), stop(1, "#ff2d95")],
    gradient_direction: "horizontal",
    outlines: [outline("#4a1035", 3)],
    shadows: [shadow("#ff2d95", 12, 0, 3)],
  }),
  makeTheme("aqua-pulse", "نبض آبی", "Aqua Pulse", "trend", ["#021d2e", "#063e58"], {
    fill_stops: [stop(0, "#d9fff8"), stop(.45, "#45f3ff"), stop(1, "#008cff")],
    gradient_direction: "vertical",
    outlines: [outline("#003f73", 3), outline("#eaffff", 1)],
    shadows: [shadow("#00d9ff", 16)],
  }),
  makeTheme("berry-chrome", "کروم بِری", "Berry Chrome", "trend", ["#20091c", "#4d123a"], {
    fill_stops: [stop(0, "#fff1fb"), stop(.22, "#ff89d6"), stop(.52, "#ffffff"), stop(.75, "#bd2f91"), stop(1, "#63104d")],
    gradient_direction: "vertical",
    outlines: [outline("#3a082d", 4), outline("#ffb8e7", 1)],
    shadows: [shadow("#ff36b7", 10, 0, 4)],
  }),
  makeTheme("lime-pop", "لیمویی پاپ", "Lime Pop", "trend", ["#0b221a", "#153c20"], {
    fill_stops: [stop(0, "#f7ff62"), stop(1, "#58f779")],
    gradient_direction: "diagonal",
    outlines: [outline("#071b12", 4)],
    depth: 5,
    depth_color: "#16883d",
    depth_offset_x: .65,
    depth_offset_y: 1,
    shadows: [shadow("#000000", 7, 2, 7)],
  }),
  makeTheme("cosmic-candy", "آبنبات کیهانی", "Cosmic Candy", "trend", ["#09051c", "#21114f"], {
    fill_stops: [stop(0, "#58e7ff"), stop(.35, "#9a7cff"), stop(.7, "#ff66cf"), stop(1, "#ffd166")],
    gradient_direction: "horizontal",
    outlines: [outline("#ffffff", 1.5), outline("#23104d", 4)],
    shadows: [shadow("#9c5cff", 18), shadow("#000000", 5, 0, 5)],
  }),
  makeTheme("peach-glow", "درخشش هلویی", "Peach Glow", "trend", ["#32152d", "#6b2c44"], {
    fill_stops: [stop(0, "#fff1d6"), stop(.5, "#ffc19f"), stop(1, "#ff7d91")],
    gradient_direction: "vertical",
    outlines: [outline("#7a2b47", 2)],
    shadows: [shadow("#ff8c9e", 18, 0, 2)],
  }),
  makeTheme("electric-violet", "بنفش الکتریکی", "Electric Violet", "trend", ["#0b0730", "#251175"], {
    fill_stops: [stop(0, "#f5e8ff"), stop(.4, "#ba7cff"), stop(1, "#6536ff")],
    gradient_direction: "vertical",
    outlines: [outline("#16095d", 4), outline("#ffffff", 1)],
    shadows: [shadow("#854dff", 17)],
  }),
  makeTheme("ocean-reel", "ریلز اقیانوسی", "Ocean Reel", "trend", ["#001b35", "#005a75"], {
    fill_stops: [stop(0, "#e8ffff"), stop(.35, "#58f3e8"), stop(1, "#00a7e8")],
    gradient_direction: "diagonal",
    outlines: [outline("#00495e", 3)],
    depth: 3,
    depth_color: "#00718c",
    shadows: [shadow("#00131d", 6, 0, 6)],
  }),
  makeTheme("rose-ice", "یخ رز", "Rose Ice", "trend", ["#2b1021", "#631b3e"], {
    fill_stops: [stop(0, "#ffffff"), stop(.28, "#ffd4ec"), stop(.58, "#ff8cc8"), stop(1, "#d9368b")],
    gradient_direction: "vertical",
    outlines: [outline("#7d164f", 3), outline("#fff2fa", 1)],
    shadows: [shadow("#ff5aad", 12, 0, 3)],
  }),
);

// Metallic themes — multiple highlights create gold, silver, chrome, and steel surfaces.
textThemes.push(
  makeTheme("royal-gold", "طلای سلطنتی", "Royal Gold", "metallic", ["#150f02", "#392806"], {
    fill_stops: [stop(0, "#6d4300"), stop(.16, "#ffe991"), stop(.34, "#fff7c7"), stop(.52, "#c88a09"), stop(.72, "#fff1a0"), stop(1, "#704300")],
    gradient_direction: "vertical",
    outlines: [outline("#3a2200", 4), outline("#ffe69a", 1)],
    depth: 4,
    depth_color: "#6b4308",
    shadows: [shadow("#000000", 8, 1, 7)],
  }),
  makeTheme("champagne-gold", "طلای شامپاینی", "Champagne Gold", "metallic", ["#23190f", "#5a4631"], {
    fill_stops: [stop(0, "#7d6549"), stop(.2, "#f9e7c1"), stop(.45, "#fffaf0"), stop(.65, "#d6b681"), stop(1, "#8a6d48")],
    gradient_direction: "vertical",
    outlines: [outline("#5c4328", 3), outline("#fff4d8", 1)],
    shadows: [shadow("#000000", 7, 0, 5)],
  }),
  makeTheme("antique-gold", "طلای آنتیک", "Antique Gold", "metallic", ["#16140b", "#383019"], {
    fill_stops: [stop(0, "#4d3e0c"), stop(.25, "#c9aa3b"), stop(.48, "#f6dc72"), stop(.68, "#8e721e"), stop(1, "#d1b24a")],
    gradient_direction: "diagonal",
    outlines: [outline("#2d260c", 4), outline("#d9bd54", 1)],
    depth: 5,
    depth_color: "#4a3a0c",
    shadows: [shadow("#000000", 5, 2, 7)],
  }),
  makeTheme("rose-gold", "رزگلد", "Rose Gold", "metallic", ["#28151a", "#5f343a"], {
    fill_stops: [stop(0, "#6f3a40"), stop(.18, "#ffd4c8"), stop(.4, "#fff0e8"), stop(.62, "#c77b77"), stop(.82, "#ffe0d1"), stop(1, "#784148")],
    gradient_direction: "vertical",
    outlines: [outline("#51272d", 4), outline("#ffd5ca", 1)],
    shadows: [shadow("#12070a", 8, 1, 6)],
  }),
  makeTheme("black-gold", "طلای مشکی", "Black Gold", "metallic", ["#050505", "#24200e"], {
    fill_stops: [stop(0, "#0a0a0a"), stop(.3, "#f6d461"), stop(.5, "#fff0a8"), stop(.7, "#a56c00"), stop(1, "#080808")],
    gradient_direction: "diagonal",
    outlines: [outline("#000000", 5), outline("#d6a923", 1.5)],
    depth: 3,
    depth_color: "#332500",
    shadows: [shadow("#000000", 10, 0, 7)],
  }),
  makeTheme("liquid-silver", "نقره مایع", "Liquid Silver", "metallic", ["#10151c", "#34404d"], {
    fill_stops: [stop(0, "#39434d"), stop(.14, "#f7fbff"), stop(.31, "#929eaa"), stop(.48, "#ffffff"), stop(.68, "#707b86"), stop(.86, "#eef4f8"), stop(1, "#3b4650")],
    gradient_direction: "vertical",
    outlines: [outline("#202933", 4), outline("#f5fbff", 1)],
    shadows: [shadow("#000000", 8, 1, 6)],
  }),
  makeTheme("chrome-silver", "نقره کروم", "Chrome Silver", "metallic", ["#11131a", "#313745"], {
    fill_stops: [stop(0, "#171b20"), stop(.17, "#ffffff"), stop(.34, "#87929d"), stop(.5, "#eef5fa"), stop(.58, "#4b5661"), stop(.78, "#ffffff"), stop(1, "#242b32")],
    gradient_direction: "vertical",
    outlines: [outline("#11161c", 5), outline("#d9e2e8", 1.5)],
    depth: 4,
    depth_color: "#303943",
    shadows: [shadow("#000000", 6, 2, 7)],
  }),
  makeTheme("platinum", "پلاتینیوم", "Platinum", "metallic", ["#181b20", "#4a5059"], {
    fill_stops: [stop(0, "#7e858d"), stop(.24, "#f8f9fa"), stop(.44, "#c7ccd1"), stop(.66, "#ffffff"), stop(1, "#777f88")],
    gradient_direction: "diagonal",
    outlines: [outline("#343a40", 3), outline("#ffffff", 1)],
    shadows: [shadow("#000000", 9, 0, 5)],
  }),
  makeTheme("gunmetal", "گان‌متال", "Gunmetal", "metallic", ["#090b0e", "#252a31"], {
    fill_stops: [stop(0, "#11161b"), stop(.25, "#818b95"), stop(.46, "#d2d8dd"), stop(.65, "#4a545e"), stop(1, "#101419")],
    gradient_direction: "vertical",
    outlines: [outline("#050608", 4), outline("#7d8790", 1)],
    depth: 5,
    depth_color: "#1b2229",
    shadows: [shadow("#000000", 9, 2, 8)],
  }),
  makeTheme("silver-ice", "نقره یخی", "Silver Ice", "metallic", ["#08202d", "#164a61"], {
    fill_stops: [stop(0, "#5b7f91"), stop(.18, "#ffffff"), stop(.4, "#bfefff"), stop(.58, "#edfaff"), stop(.78, "#70aabd"), stop(1, "#dff8ff")],
    gradient_direction: "vertical",
    outlines: [outline("#16495a", 4), outline("#eaffff", 1)],
    shadows: [shadow("#54d9ff", 13, 0, 2)],
  }),
);

// Neon themes.
textThemes.push(
  makeTheme("neon-pink", "نئون صورتی", "Neon Pink", "neon", ["#090711", "#260720"], { color: "#fff7fc", outlines: [outline("#ff3cac", 3)], shadows: [shadow("#ff2ba6", 22), shadow("#ff2ba6", 8)] }),
  makeTheme("neon-cyan", "نئون فیروزه‌ای", "Neon Cyan", "neon", ["#041218", "#07313b"], { color: "#efffff", outlines: [outline("#21ecff", 3)], shadows: [shadow("#00e5ff", 22), shadow("#00e5ff", 8)] }),
  makeTheme("neon-violet", "نئون بنفش", "Neon Violet", "neon", ["#0b061a", "#27105b"], { color: "#fff8ff", outlines: [outline("#9b5cff", 3)], shadows: [shadow("#8f4cff", 24), shadow("#d36cff", 8)] }),
  makeTheme("neon-lime", "نئون لیمویی", "Neon Lime", "neon", ["#07120b", "#15351b"], { color: "#fbfff1", outlines: [outline("#7cff45", 3)], shadows: [shadow("#61ff38", 23), shadow("#a7ff5b", 8)] }),
  makeTheme("neon-sunset", "نئون غروب", "Neon Sunset", "neon", ["#170619", "#48112b"], { fill_stops: [stop(0, "#fff7d1"), stop(1, "#ffffff")], gradient_direction: "horizontal", outlines: [outline("#ff6a3d", 3)], shadows: [shadow("#ff2d8d", 22), shadow("#ff8a35", 10)] }),
  makeTheme("neon-blue", "نئون آبی", "Neon Blue", "neon", ["#03091c", "#092a66"], { color: "#f2f7ff", outlines: [outline("#3478ff", 3)], shadows: [shadow("#1267ff", 24), shadow("#3ba7ff", 8)] }),
  makeTheme("neon-red", "نئون قرمز", "Neon Red", "neon", ["#160404", "#4c0d0d"], { color: "#fff7f4", outlines: [outline("#ff3131", 3)], shadows: [shadow("#ff1d1d", 23), shadow("#ff653f", 8)] }),
  makeTheme("neon-white", "نئون سفید", "Neon White", "neon", ["#06080c", "#252a32"], { color: "#ffffff", outlines: [outline("#dff8ff", 2)], shadows: [shadow("#e8fbff", 20), shadow("#79dfff", 8)] }),
);

// 3D themes.
textThemes.push(
  makeTheme("pop-3d-yellow", "سه‌بعدی زرد", "Yellow Pop 3D", "3d", ["#17120a", "#47351a"], { fill_stops: [stop(0, "#fff76a"), stop(1, "#ffc400")], gradient_direction: "vertical", outlines: [outline("#19130a", 4)], depth: 8, depth_color: "#8d5700", shadows: [shadow("#000000", 8, 2, 10)] }),
  makeTheme("coral-3d", "سه‌بعدی مرجانی", "Coral 3D", "3d", ["#291019", "#652233"], { fill_stops: [stop(0, "#ffb08e"), stop(1, "#ff526c")], gradient_direction: "vertical", outlines: [outline("#5b1830", 4)], depth: 8, depth_color: "#9e294b", shadows: [shadow("#000000", 8, 2, 10)] }),
  makeTheme("violet-3d", "سه‌بعدی بنفش", "Violet 3D", "3d", ["#130d31", "#3c247d"], { fill_stops: [stop(0, "#e8c7ff"), stop(1, "#8d52ff")], gradient_direction: "vertical", outlines: [outline("#291064", 4)], depth: 9, depth_color: "#4a24a8", shadows: [shadow("#000000", 8, 2, 11)] }),
  makeTheme("ocean-3d", "سه‌بعدی اقیانوسی", "Ocean 3D", "3d", ["#051c2b", "#0c4d62"], { fill_stops: [stop(0, "#bafff5"), stop(1, "#16c6d9")], gradient_direction: "vertical", outlines: [outline("#063d4a", 4)], depth: 8, depth_color: "#08758a", shadows: [shadow("#000000", 8, 2, 10)] }),
  makeTheme("mint-3d", "سه‌بعدی نعنایی", "Mint 3D", "3d", ["#10251d", "#266148"], { fill_stops: [stop(0, "#e2ffd4"), stop(1, "#65e68d")], gradient_direction: "vertical", outlines: [outline("#174d33", 4)], depth: 8, depth_color: "#2b9c5b", shadows: [shadow("#000000", 7, 2, 10)] }),
  makeTheme("candy-3d", "سه‌بعدی آبنباتی", "Candy 3D", "3d", ["#28132e", "#6e2e6c"], { fill_stops: [stop(0, "#fff2fd"), stop(.5, "#ff8ddd"), stop(1, "#b768ff")], gradient_direction: "diagonal", outlines: [outline("#54205f", 4), outline("#fff1ff", 1)], depth: 7, depth_color: "#7b36a8", shadows: [shadow("#000000", 8, 2, 9)] }),
  makeTheme("stone-3d", "سه‌بعدی سنگی", "Stone 3D", "3d", ["#141414", "#424242"], { fill_stops: [stop(0, "#f0eee8"), stop(.45, "#aaa7a0"), stop(1, "#dedbd4")], gradient_direction: "vertical", outlines: [outline("#3a3936", 4)], depth: 8, depth_color: "#66635f", shadows: [shadow("#000000", 10, 3, 11)] }),
  makeTheme("obsidian-3d", "سه‌بعدی آبسیدین", "Obsidian 3D", "3d", ["#030303", "#1d1a24"], { fill_stops: [stop(0, "#4e4857"), stop(.35, "#17141b"), stop(.55, "#8a7a9a"), stop(1, "#0a090c")], gradient_direction: "vertical", outlines: [outline("#000000", 5), outline("#756685", 1)], depth: 9, depth_color: "#17121d", shadows: [shadow("#000000", 12, 3, 12)] }),
);

// Minimal themes.
textThemes.push(
  makeTheme("ink-clean", "جوهر مینیمال", "Ink Clean", "minimal", ["#e9ecef", "#ffffff"], { color: "#111827", font_weight: 800 }),
  makeTheme("white-soft", "سفید نرم", "Soft White", "minimal", ["#27364a", "#53677f"], { color: "#ffffff", shadows: [shadow("#0b1220", 7, 0, 4)], font_weight: 800 }),
  makeTheme("midnight-clean", "نیمه‌شب", "Midnight Clean", "minimal", ["#dce6f0", "#f7fafc"], { color: "#101b31", outlines: [outline("#59708f", 1)], font_weight: 800 }),
  makeTheme("editorial-red", "قرمز ادیتوریال", "Editorial Red", "minimal", ["#f7f0eb", "#fffdf9"], { color: "#d92828", font_weight: 900 }),
  makeTheme("warm-sand", "شن گرم", "Warm Sand", "minimal", ["#2a241d", "#514536"], { color: "#f4dfbd", outlines: [outline("#6c583d", 1)], font_weight: 800 }),
  makeTheme("mono-outline", "دورخط مونو", "Mono Outline", "minimal", ["#0e1116", "#303641"], { color: "#0e1116", outlines: [outline("#ffffff", 2.5)], shadows: [shadow("#000000", 3, 0, 3)] }),
  makeTheme("clean-blue", "آبی تمیز", "Clean Blue", "minimal", ["#eff7ff", "#ffffff"], { color: "#1769e0", outlines: [outline("#b9d6ff", 1)], font_weight: 900 }),
);

// Cinematic and premium themes.
textThemes.push(
  makeTheme("movie-gold", "طلایی سینمایی", "Movie Gold", "cinematic", ["#080706", "#2a2110"], { fill_stops: [stop(0, "#8c620e"), stop(.26, "#ffe89a"), stop(.52, "#fff6ce"), stop(.74, "#c79422"), stop(1, "#6a4305")], gradient_direction: "vertical", outlines: [outline("#2b1a00", 4)], shadows: [shadow("#000000", 13, 1, 8)] }),
  makeTheme("noir-title", "عنوان نوآر", "Noir Title", "cinematic", ["#050505", "#252525"], { fill_stops: [stop(0, "#ffffff"), stop(.5, "#b7b7b7"), stop(1, "#f5f5f5")], gradient_direction: "vertical", outlines: [outline("#000000", 5)], shadows: [shadow("#ffffff", 4, 0, 0)], font_weight: 900 }),
  makeTheme("fire-title", "عنوان آتشین", "Fire Title", "cinematic", ["#180300", "#5a1000"], { fill_stops: [stop(0, "#fff5a5"), stop(.36, "#ffb000"), stop(.72, "#ff3b11"), stop(1, "#9d0000")], gradient_direction: "vertical", outlines: [outline("#4a0900", 4)], shadows: [shadow("#ff2a00", 15, 0, 4)] }),
  makeTheme("ice-title", "عنوان یخی", "Ice Title", "cinematic", ["#031321", "#0d496a"], { fill_stops: [stop(0, "#ffffff"), stop(.34, "#c6f6ff"), stop(.7, "#58c9ff"), stop(1, "#1477b9")], gradient_direction: "vertical", outlines: [outline("#0a4b72", 4), outline("#f0feff", 1)], shadows: [shadow("#4cd9ff", 12, 0, 3)] }),
  makeTheme("retro-poster", "پوستر رترو", "Retro Poster", "cinematic", ["#392d22", "#7a5738"], { fill_stops: [stop(0, "#fff1b8"), stop(1, "#e8a94f")], gradient_direction: "vertical", outlines: [outline("#4b2b1b", 5)], depth: 6, depth_color: "#9b472b", shadows: [shadow("#24160e", 4, 3, 8)] }),
  makeTheme("cyberpunk", "سایبرپانک", "Cyberpunk", "cinematic", ["#07051b", "#26105b"], { fill_stops: [stop(0, "#00f6ff"), stop(.48, "#c8ff00"), stop(1, "#ff2bd6")], gradient_direction: "horizontal", outlines: [outline("#13043d", 4), outline("#ffffff", 1)], shadows: [shadow("#ff2bd6", 15, 3, 0), shadow("#00eaff", 12, -3, 0)] }),
  makeTheme("luxury-emerald", "زمرد لوکس", "Luxury Emerald", "cinematic", ["#04130e", "#123b2b"], { fill_stops: [stop(0, "#d8fff0"), stop(.3, "#68e6b4"), stop(.58, "#d6b65b"), stop(1, "#1b8a65")], gradient_direction: "diagonal", outlines: [outline("#052d20", 4), outline("#e9cf7a", 1)], shadows: [shadow("#000000", 9, 1, 7)] }),
);

if (quickStyles.length !== 60 || textThemes.length !== 50) {
  throw new Error(`Unexpected catalog size: quick=${quickStyles.length}, themes=${textThemes.length}`);
}

const sqlQuote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const jsonSql = (value) => `${sqlQuote(JSON.stringify(value))}::jsonb`;

const quickValues = quickStyles.map((item) => `  (${[
  sqlQuote(item.slug),
  sqlQuote(item.title),
  sqlQuote(item.category),
  sqlQuote(item.asset_url),
  sqlQuote(item.preview_url),
  sqlQuote(item.text_color),
  item.is_active,
  item.sort_order,
].join(", ")})`).join(",\n");

const themeValues = textThemes.map((item) => `  (${[
  sqlQuote(item.slug),
  sqlQuote(item.title_fa),
  sqlQuote(item.title_en),
  sqlQuote(item.category),
  sqlQuote(item.preview_text_fa),
  sqlQuote(item.preview_text_en),
  jsonSql(item.effects_json),
  item.supports_fa,
  item.supports_en,
  item.is_active,
  item.sort_order,
].join(", ")})`).join(",\n");

const quickSlugs = quickStyles.map((item) => sqlQuote(item.slug)).join(", ");
const themeSlugs = textThemes.map((item) => sqlQuote(item.slug)).join(", ");

const migration = `-- Fonto quick-style and bilingual text-theme libraries used by the static editor.
-- The retired fonto_styles table is intentionally removed.

begin;
set local lock_timeout = '5s';

drop table if exists public.fonto_styles;

create table if not exists public.fonto_quick_styles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default 'instagram',
  asset_url text not null,
  preview_url text not null,
  text_color text not null default '#ffffff',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.fonto_text_themes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_fa text not null,
  title_en text not null,
  category text not null default 'trend',
  preview_text_fa text not null default 'نمونه فارسی',
  preview_text_en text not null default 'English Style',
  effects_json jsonb not null default '{}'::jsonb,
  supports_fa boolean not null default true,
  supports_en boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint fonto_text_themes_bilingual check (supports_fa and supports_en)
);

create table if not exists public.fonto_import_history (
  id uuid primary key default gen_random_uuid(),
  file_count integer not null default 0,
  success_count integer not null default 0,
  failed_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_fonto_quick_styles_category_sort
  on public.fonto_quick_styles(category, sort_order);
create index if not exists idx_fonto_text_themes_category_sort
  on public.fonto_text_themes(category, sort_order);

alter table public.fonto_quick_styles enable row level security;
alter table public.fonto_text_themes enable row level security;
alter table public.fonto_import_history enable row level security;

revoke all on table public.fonto_quick_styles from anon, authenticated;
revoke all on table public.fonto_text_themes from anon, authenticated;
revoke all on table public.fonto_import_history from anon, authenticated;
grant select on table public.fonto_quick_styles to anon, authenticated;
grant select on table public.fonto_text_themes to anon, authenticated;

drop policy if exists "Active Fonto quick styles are publicly readable" on public.fonto_quick_styles;
create policy "Active Fonto quick styles are publicly readable"
  on public.fonto_quick_styles
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Active bilingual Fonto text themes are publicly readable" on public.fonto_text_themes;
create policy "Active bilingual Fonto text themes are publicly readable"
  on public.fonto_text_themes
  for select
  to anon, authenticated
  using (is_active = true and supports_fa = true and supports_en = true);

insert into public.fonto_quick_styles
  (slug, title, category, asset_url, preview_url, text_color, is_active, sort_order)
values
${quickValues}
on conflict (slug) do update
set title = excluded.title,
    category = excluded.category,
    asset_url = excluded.asset_url,
    preview_url = excluded.preview_url,
    text_color = excluded.text_color,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;

delete from public.fonto_quick_styles
where slug not in (${quickSlugs});

insert into public.fonto_text_themes
  (slug, title_fa, title_en, category, preview_text_fa, preview_text_en, effects_json,
   supports_fa, supports_en, is_active, sort_order)
values
${themeValues}
on conflict (slug) do update
set title_fa = excluded.title_fa,
    title_en = excluded.title_en,
    category = excluded.category,
    preview_text_fa = excluded.preview_text_fa,
    preview_text_en = excluded.preview_text_en,
    effects_json = excluded.effects_json,
    supports_fa = excluded.supports_fa,
    supports_en = excluded.supports_en,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;

delete from public.fonto_text_themes
where slug not in (${themeSlugs});

commit;
`;

await Promise.all([
  writeFile(path.join(root, "supabase/imports/fonto_quick_styles.json"), `${JSON.stringify(quickStyles, null, 2)}\n`),
  writeFile(path.join(root, "supabase/imports/fonto_text_themes.json"), `${JSON.stringify(textThemes, null, 2)}\n`),
  writeFile(path.join(root, "supabase/migrations/fonto_library_tables.sql"), migration),
]);

console.log(`Generated ${quickStyles.length} quick styles and ${textThemes.length} bilingual text themes.`);
