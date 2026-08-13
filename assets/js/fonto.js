/* EditorsTeam Fonto — Supabase fonts, quick PNG styles, bilingual text themes, and canvas editor */
(() => {
  "use strict";

  const SUPABASE_URL = "https://yxzekduddsewulkbdcoz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB";
  const SESSION_KEY = "editorsTeam.fonto.access.v2";
  const FONT_CACHE = "editorsTeam-fonto-fonts-v4";
  const $ = (id) => document.getElementById(id);
  const clamp = (number, min, max) => Math.max(min, Math.min(max, number));
  const loadedFonts = new Map();

  const state = {
    unlocked: false,
    canvas: null,
    ctx: null,
    bg: "#1769e0",
    bgImage: null,
    quickStyle: null,
    quickStyleImage: null,
    themeId: null,
    text: "متن خود را بنویسید",
    textAlign: "center",
    textDirection: "rtl",
    lineHeight: 1.18,
    font: "Tahoma",
    fontId: "",
    fontUrl: "",
    fontWeight: 800,
    size: 44,
    color: "#ffffff",
    fillStops: [],
    gradientDirection: "horizontal",
    stroke: "#000000",
    strokeWidth: 0,
    outlineLayers: [],
    shadow: true,
    shadowBlur: 12,
    shadowColor: "#000000",
    shadowOffsetX: 0,
    shadowOffsetY: 5,
    shadowLayers: [],
    gradient: false,
    gradientA: "#ffffff",
    gradientB: "#18d96b",
    depth: 0,
    depthColor: "#111111",
    depthOffsetX: 0.55,
    depthOffsetY: 1,
    opacity: 1,
    rotate: 0,
    x: 0.5,
    y: 0.5,
    scale: 1,
  };

  const THEME_CATEGORY_LABELS = {
    all: "همه",
    trend: "ترند",
    metallic: "طلایی و نقره‌ای",
    neon: "نئون",
    "3d": "سه‌بعدی",
    minimal: "مینیمال",
    cinematic: "سینمایی",
  };

  const QUICK_CATEGORY_LABELS = {
    all: "همه",
    instagram: "ترند",
    glass: "شیشه‌ای",
    neon: "نئون",
    special: "ویژه‌ها",
  };

  const FONT_CATEGORY_LABELS = {
    all: "همه",
    persian: "فارسی",
    arabic: "العربية",
    english: "English",
    hindi: "हिन्दी",
    japanese: "日本語",
    turkish: "Türkçe",
  };

  const FONT_PREVIEW_TEXT = "ادیتورز تیم";
  const NORMAL_TEXT_SIZE = 44;
  const MIN_TEXT_SIZE = 2;
  const MAX_TEXT_SIZE = 180;

  let fontAssets = [];
  let quickStyles = [];
  let textThemes = [];
  let activeFontCategory = "all";
  let activeQuickCategory = "all";
  let activeThemeCategory = "all";
  let renderedFontCount = 0;
  let currentVisibleFonts = [];
  const FONT_BATCH_SIZE = 8;

  function status(message, type = "neutral") {
    const element = $("fontoStatus");
    if (!element) return;
    element.textContent = message;
    element.className = "fonto-status " + type;
  }

  function remember() {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ok: true, at: Date.now() }));
  }

  function hasSession() {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      return Boolean(session?.ok && Date.now() - session.at < 28_800_000);
    } catch {
      return false;
    }
  }

  function encodeStoragePath(path) {
    return String(path || "").replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");
  }

  function publicUrl(bucket, path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    const cleanPath = String(path).replace(new RegExp("^" + bucket + "/"), "");
    return SUPABASE_URL + "/storage/v1/object/public/" + bucket + "/" + encodeStoragePath(cleanPath);
  }

  async function api(table, query) {
    const response = await fetch(SUPABASE_URL + "/rest/v1/" + table + "?" + query, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
        Accept: "application/json",
      },
    });
    if (!response.ok) throw new Error(table + " " + response.status);
    return response.json();
  }

  async function verify() {
    const input = $("fontoPassword");
    const password = input?.value || "";
    if (!password) return status("لطفاً رمز ورود را وارد کنید.", "bad");
    const button = $("fontoLoginBtn");
    if (button) {
      button.disabled = true;
      button.textContent = "در حال بررسی...";
    }
    try {
      const response = await fetch(SUPABASE_URL + "/rest/v1/rpc/verify_fonto_password", {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input_password: password }),
      });
      const allowed = response.ok ? await response.json() : false;
      if (allowed === true) {
        remember();
        await unlock();
      } else {
        status("رمز ورود صحیح نیست.", "bad");
      }
    } catch {
      status("اتصال به Supabase برقرار نشد.", "bad");
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "ورود به ابزار فونت";
      }
      if (input) input.value = "";
    }
  }

  function fontPriority(name) {
    const normalized = String(name || "").toLowerCase();
    const preferred = [
      "iransansx-900",
      "dana-bold",
      "estedad",
      "shabnam-bold",
      "fa_peyda_bold",
      "graphik arabic bold",
      "diodrumarabic-bold",
      "noto",
      "open sans",
    ];
    const index = preferred.findIndex((item) => normalized.includes(item));
    return index === -1 ? 999 : index;
  }

  async function getFonts() {
    const rows = await api("fonto_fonts", "select=*&is_active=eq.true&order=name.asc");
    return rows
      .map((item) => {
        const file = item.file_url || item.file_name;
        return {
          id: item.id || file,
          name: item.name || item.family || file?.replace(/\.(ttf|otf|woff2?)$/i, ""),
          fileName: file,
          url: publicUrl("fonto-fonts", file),
          category: item.category || "persian",
          previewText: FONT_PREVIEW_TEXT,
        };
      })
      .filter((item) => item.name && item.url)
      .sort((a, b) => fontPriority(a.name) - fontPriority(b.name) || a.name.localeCompare(b.name));
  }

  async function getQuickStyles() {
    const rows = await api(
      "fonto_quick_styles",
      "select=*&is_active=eq.true&order=sort_order.asc,created_at.asc",
    );
    return rows
      .map((item) => ({
        ...item,
        asset: publicUrl("fonto-text-boxes", item.asset_url),
        preview: publicUrl("fonto-text-boxes", item.preview_url || item.asset_url),
      }))
      .filter((item) => item.asset && item.preview);
  }

  async function getTextThemes() {
    return api(
      "fonto_text_themes",
      "select=*&is_active=eq.true&supports_fa=eq.true&supports_en=eq.true&order=sort_order.asc,created_at.asc",
    );
  }

  async function cacheFetch(url) {
    if (!("caches" in window)) return fetch(url);
    const cache = await caches.open(FONT_CACHE);
    const cached = await cache.match(url);
    if (cached) return cached;
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("font " + response.status);
    await cache.put(url, response.clone());
    return response;
  }

  function hash(value) {
    let result = 0;
    for (let index = 0; index < value.length; index += 1) {
      result = (result << 5) - result + value.charCodeAt(index);
      result |= 0;
    }
    return Math.abs(result);
  }

  async function loadFont(font) {
    if (!font?.url) return font?.name || "Tahoma";

    // Bind every preview to its exact Supabase row, including duplicate names.
    const rowId = String(font.id || font.fileName || font.url);
    const cacheKey = rowId + "|" + font.url;
    if (loadedFonts.has(cacheKey)) return loadedFonts.get(cacheKey);

    const loading = (async () => {
      const response = await cacheFetch(font.url);
      const bytes = await response.arrayBuffer();
      const family = "FontoRow_" + hash(cacheKey);
      const face = new FontFace(family, bytes, {
        style: "normal",
        weight: "400",
        display: "swap",
      });
      const loadedFace = await face.load();
      document.fonts.add(loadedFace);
      if (document.fonts.ready) await document.fonts.ready;
      if (document.fonts.has && !document.fonts.has(loadedFace)) {
        throw new Error("FontFace was not registered for row " + rowId);
      }
      return family;
    })();

    loadedFonts.set(cacheKey, loading);
    try {
      return await loading;
    } catch (error) {
      loadedFonts.delete(cacheKey);
      throw error;
    }
  }

  async function populateFonts() {
    try {
      fontAssets = await getFonts();
      if (!fontAssets.length) throw new Error("No active fonts");
      state.font = fontAssets[0].name;
      state.fontId = fontAssets[0].id;
      state.fontUrl = fontAssets[0].url;
      activeFontCategory = "all";
      renderFontCategories();
      renderFontPreviews();
    } catch (error) {
      console.error(error);
      state.font = "Tahoma";
      state.fontId = "";
      state.fontUrl = "";
      const wrap = $("fontoFontPreviews");
      if (wrap) wrap.innerHTML = '<span class="fonto-library-message">پیش‌نمایش فونت‌ها در دسترس نیست.</span>';
      if ($("fontoFontPreviewCount")) $("fontoFontPreviewCount").textContent = "خطا در دریافت";
    }
  }

  function scrollLibrary(id, amount) {
    $(id)?.scrollBy({ left: amount, behavior: "smooth" });
  }

  function ensureFontLibraryPanel() {
    let panel = $("fontoFontLibraryPanel");
    if (panel) return panel;
    const controls = document.querySelector(".fonto-controls");
    if (!controls) return null;
    panel = document.createElement("section");
    panel.id = "fontoFontLibraryPanel";
    panel.className = "fonto-panel fonto-library-panel fonto-font-library-panel";
    panel.innerHTML =
      '<div class="fonto-library-heading"><div><h3>پیش‌نمایش فونت‌ها</h3>' +
      '<small id="fontoFontPreviewCount">در حال دریافت...</small></div>' +
      '<div class="fonto-library-nav" aria-label="پیمایش پیش‌نمایش فونت‌ها">' +
      '<button id="fontoFontPrev" type="button" aria-label="قبلی">‹</button>' +
      '<button id="fontoFontNext" type="button" aria-label="بعدی">›</button></div></div>' +
      '<div id="fontoFontCategories" class="fonto-category-scroll" aria-label="دسته‌بندی فونت‌ها"></div>' +
      '<div id="fontoFontPreviews" class="fonto-template-grid fonto-font-preview-grid" aria-live="polite">' +
      '<span class="fonto-library-message">در حال ساخت پیش‌نمایش همهٔ فونت‌ها...</span></div>' +
      '<p class="fonto-library-help">برای دیدن فونت‌های بیشتر افقی بکشید؛ خود فونت‌ها هنگام دیده‌شدن بارگذاری می‌شوند.</p>';
    const fontPanel = controls.querySelector(".fonto-font-panel");
    if (fontPanel) fontPanel.after(panel);
    else controls.prepend(panel);
    $("fontoFontPrev")?.addEventListener("click", () => scrollLibrary("fontoFontPreviews", 300));
    $("fontoFontNext")?.addEventListener("click", () => scrollLibrary("fontoFontPreviews", -300));
    return panel;
  }

  function renderFontCategories() {
    const wrap = $("fontoFontCategories");
    if (!wrap) return;
    const available = new Set(fontAssets.map((font) => font.category).filter(Boolean));
    const categories = [
      "all",
      ...["persian", "arabic", "english", "hindi", "japanese", "turkish"].filter((category) => available.has(category)),
      ...[...available].filter((category) => !(category in FONT_CATEGORY_LABELS)),
    ];
    wrap.replaceChildren();
    for (const category of categories) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fonto-category-chip" + (activeFontCategory === category ? " active" : "");
      button.textContent = FONT_CATEGORY_LABELS[category] || category;
      button.addEventListener("click", () => {
        activeFontCategory = category;
        renderFontCategories();
        renderFontPreviews();
      });
      wrap.appendChild(button);
    }
  }

  function visibleFonts() {
    return activeFontCategory === "all"
      ? fontAssets
      : fontAssets.filter((font) => font.category === activeFontCategory);
  }

  async function applyFontPreview(card, font) {
    if (!card?.isConnected || card.dataset.loaded === "true") return;
    card.dataset.loaded = "loading";
    try {
      const family = await loadFont(font);
      if (!card.isConnected) return;
      const sample = card.querySelector("canvas.fonto-font-sample");
      if (sample) renderFontSample(sample, family, font);
      card.dataset.loaded = "true";
    } catch (error) {
      console.warn("Font preview failed", font.name, error);
      card.dataset.loaded = "failed";
    }
  }

  function renderFontSample(canvas, family, font) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    let size = 62;
    do {
      ctx.font = size + 'px "' + family + '"';
      size -= 1;
    } while (size > 18 && ctx.measureText(FONT_PREVIEW_TEXT).width > width - 22);
    ctx.fillText(FONT_PREVIEW_TEXT, width / 2, height / 2 + 2);
    canvas.dataset.fontFamily = family;
    canvas.dataset.fontRowId = String(font.id || "");
    canvas.dataset.fontFile = String(font.fileName || "");
  }

  function syncVisibleFontPreviews(wrap) {
    if (!wrap?.isConnected) return;
    const rootRect = wrap.getBoundingClientRect();
    const cards = [...wrap.querySelectorAll(".fonto-font-card")];
    const measurable = rootRect.width > 0;
    const visibleCards = measurable
      ? cards.filter((card) => {
          const rect = card.getBoundingClientRect();
          return rect.right > rootRect.left && rect.left < rootRect.right;
        })
      : cards.slice(0, 4);

    visibleCards.forEach((card) => applyFontPreview(card, card._fontAsset));

    const lastCard = cards[cards.length - 1];
    if (!lastCard || renderedFontCount >= currentVisibleFonts.length || !measurable) return;
    const lastRect = lastCard.getBoundingClientRect();
    if (lastRect.right > rootRect.left - 24 && lastRect.left < rootRect.right + 24) {
      appendFontBatch(wrap);
    }
  }

  function scheduleVisibleFontPreviews(wrap) {
    if (wrap._fontPreviewFrame) return;
    const schedule = window.requestAnimationFrame || ((callback) => window.setTimeout(callback, 16));
    wrap._fontPreviewFrame = schedule(() => {
      wrap._fontPreviewFrame = 0;
      syncVisibleFontPreviews(wrap);
    });
  }

  function syncSelectedFontCards() {
    document.querySelectorAll(".fonto-font-card").forEach((card) => {
      const active = card.dataset.fontUrl === state.fontUrl;
      card.classList.toggle("active", active);
      card.setAttribute("aria-pressed", String(active));
    });
  }

  async function chooseFont(font) {
    state.font = font.name;
    state.fontId = font.id;
    state.fontUrl = font.url;
    syncSelectedFontCards();
    try {
      await loadFont(font);
    } catch {}
    draw();
  }

  function createFontCard(font) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fonto-template-card fonto-font-card" + (state.fontUrl === font.url ? " active" : "");
      button.dataset.fontUrl = font.url;
      button.dataset.fontRowId = String(font.id || "");
      button.dataset.fontFile = String(font.fileName || "");
      button.dataset.fontCategory = font.category;
      button.setAttribute("aria-pressed", String(state.fontUrl === font.url));
      button.title = font.name;
      button._fontAsset = font;
      const preview = document.createElement("span");
      preview.className = "fonto-template-preview fonto-font-preview";
      preview.dir = "rtl";
      // Keep the mobile preview square even if an older cached stylesheet is active.
      preview.style.setProperty("width", "100%", "important");
      preview.style.setProperty("height", "auto", "important");
      preview.style.setProperty("min-height", "0", "important");
      preview.style.setProperty("max-height", "none", "important");
      preview.style.setProperty("aspect-ratio", "1 / 1", "important");
      const sample = document.createElement("canvas");
      sample.className = "fonto-font-sample";
      sample.width = 240;
      sample.height = 240;
      sample.style.setProperty("width", "100%", "important");
      sample.style.setProperty("height", "100%", "important");
      sample.style.setProperty("aspect-ratio", "1 / 1", "important");
      sample.setAttribute("aria-label", "پیش‌نمایش ادیتورز تیم با فونت " + font.name);
      preview.appendChild(sample);
      const title = document.createElement("small");
      title.textContent = font.name;
      button.append(preview, title);
      button.addEventListener("click", () => chooseFont(font));
      return button;
  }

  function appendFontBatch(wrap) {
    const batch = currentVisibleFonts.slice(renderedFontCount, renderedFontCount + FONT_BATCH_SIZE);
    const cards = batch.map(createFontCard);
    cards.forEach((card) => wrap.appendChild(card));
    renderedFontCount += cards.length;
    scheduleVisibleFontPreviews(wrap);
  }

  function renderFontPreviews() {
    const wrap = $("fontoFontPreviews");
    const count = $("fontoFontPreviewCount");
    if (!wrap) return;
    currentVisibleFonts = visibleFonts();
    if (count) count.textContent = fontAssets.length.toLocaleString("fa-IR") + " فونت · بارگذاری فقط هنگام نمایش";
    wrap.replaceChildren();
    renderedFontCount = 0;
    wrap.onscroll = () => scheduleVisibleFontPreviews(wrap);
    if (!currentVisibleFonts.length) {
      const message = document.createElement("span");
      message.className = "fonto-library-message";
      message.textContent = "در این دسته فونتی وجود ندارد.";
      wrap.appendChild(message);
      return;
    }
    appendFontBatch(wrap);
  }

  function ensureQuickStylesPanel() {
    let panel = $("fontoQuickStylesPanel");
    if (panel) return panel;
    const controls = document.querySelector(".fonto-controls");
    if (!controls) return null;
    panel = document.createElement("section");
    panel.id = "fontoQuickStylesPanel";
    panel.className = "fonto-panel fonto-library-panel fonto-quick-panel";
    panel.innerHTML =
      '<div class="fonto-library-heading"><div><h3>استایل‌های سریع</h3>' +
      '<small id="fontoQuickStyleCount">در حال دریافت...</small></div>' +
      '<div class="fonto-library-nav" aria-label="پیمایش استایل‌های سریع">' +
      '<button id="fontoQuickPrev" type="button" aria-label="قبلی">‹</button>' +
      '<button id="fontoQuickNext" type="button" aria-label="بعدی">›</button></div></div>' +
      '<div id="fontoQuickCategories" class="fonto-category-scroll" aria-label="دسته‌بندی استایل‌های سریع"></div>' +
      '<div id="fontoQuickStyles" class="fonto-template-grid" aria-live="polite">' +
      '<span class="fonto-library-message">در حال دریافت استایل‌های سریع...</span></div>' +
      '<p class="fonto-library-help">استایل PNG دلخواه را انتخاب کنید؛ می‌توانید آن را با یک تم متن ترکیب کنید.</p>' +
      '<button id="fontoClearQuickStyle" type="button" class="fonto-action fonto-clear-asset">حذف استایل سریع انتخاب‌شده</button>';
    const fontLibraryPanel = ensureFontLibraryPanel();
    if (fontLibraryPanel) fontLibraryPanel.after(panel);
    else controls.prepend(panel);
    $("fontoQuickPrev")?.addEventListener("click", () => scrollLibrary("fontoQuickStyles", 300));
    $("fontoQuickNext")?.addEventListener("click", () => scrollLibrary("fontoQuickStyles", -300));
    $("fontoClearQuickStyle")?.addEventListener("click", clearQuickStyle);
    return panel;
  }

  function renderQuickCategories() {
    const wrap = $("fontoQuickCategories");
    if (!wrap) return;
    const categories = ["all", ...new Set(quickStyles.map((style) => style.category).filter(Boolean))];
    wrap.replaceChildren();
    for (const category of categories) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fonto-category-chip" + (activeQuickCategory === category ? " active" : "");
      button.textContent = QUICK_CATEGORY_LABELS[category] || category;
      button.addEventListener("click", () => {
        activeQuickCategory = category;
        renderQuickCategories();
        renderQuickStyles();
      });
      wrap.appendChild(button);
    }
  }

  function visibleQuickStyles() {
    return activeQuickCategory === "all"
      ? quickStyles
      : quickStyles.filter((style) => style.category === activeQuickCategory);
  }

  function ensureTextThemesPanel() {
    let panel = $("fontoTextThemesPanel");
    if (panel) return panel;
    const controls = document.querySelector(".fonto-controls");
    if (!controls) return null;
    panel = document.createElement("section");
    panel.id = "fontoTextThemesPanel";
    panel.className = "fonto-panel fonto-library-panel fonto-theme-panel";
    panel.innerHTML =
      '<div class="fonto-library-heading"><div><h3>تم‌های متن</h3>' +
      '<small id="fontoTextThemeCount">در حال دریافت...</small></div>' +
      '<div class="fonto-library-nav" aria-label="پیمایش تم‌های متن">' +
      '<button id="fontoThemePrev" type="button" aria-label="قبلی">‹</button>' +
      '<button id="fontoThemeNext" type="button" aria-label="بعدی">›</button></div></div>' +
      '<div id="fontoThemeCategories" class="fonto-category-scroll" aria-label="دسته‌بندی تم‌ها"></div>' +
      '<div id="fontoTextThemes" class="fonto-template-grid fonto-theme-grid" aria-live="polite">' +
      '<span class="fonto-library-message">در حال ساخت پیش‌نمایش تم‌ها...</span></div>' +
      '<p class="fonto-library-help">هر تم فقط روی متن اعمال می‌شود و برای فارسی و انگلیسی آزمایش شده است.</p>';
    const quickPanel = ensureQuickStylesPanel();
    if (quickPanel) quickPanel.after(panel);
    else controls.prepend(panel);
    $("fontoThemePrev")?.addEventListener("click", () => scrollLibrary("fontoTextThemes", 300));
    $("fontoThemeNext")?.addEventListener("click", () => scrollLibrary("fontoTextThemes", -300));
    return panel;
  }

  function renderQuickStyles() {
    const wrap = $("fontoQuickStyles");
    const count = $("fontoQuickStyleCount");
    if (!wrap) return;
    const visible = visibleQuickStyles();
    if (count) count.textContent = quickStyles.length.toLocaleString("fa-IR") + " استایل";
    wrap.replaceChildren();
    if (!quickStyles.length) {
      const message = document.createElement("span");
      message.className = "fonto-library-message";
      message.textContent = "استایل سریع در دسترس نیست.";
      wrap.appendChild(message);
      return;
    }
    for (const style of visible) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fonto-template-card" + (state.quickStyle?.id === style.id ? " active" : "");
      button.dataset.quickStyleId = style.id;
      button.title = style.title;
      const preview = document.createElement("span");
      preview.className = "fonto-template-preview fonto-quick-preview";
      const image = document.createElement("img");
      image.src = style.preview;
      image.alt = "پیش‌نمایش " + style.title;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => preview.classList.add("is-missing"));
      preview.appendChild(image);
      const title = document.createElement("small");
      title.textContent = style.title;
      button.append(preview, title);
      button.addEventListener("click", () => chooseQuickStyle(style));
      wrap.appendChild(button);
    }
  }

  function renderThemeCategories() {
    const wrap = $("fontoThemeCategories");
    if (!wrap) return;
    const categories = ["all", ...new Set(textThemes.map((theme) => theme.category).filter(Boolean))];
    wrap.replaceChildren();
    for (const category of categories) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fonto-category-chip" + (activeThemeCategory === category ? " active" : "");
      button.textContent = THEME_CATEGORY_LABELS[category] || category;
      button.addEventListener("click", () => {
        activeThemeCategory = category;
        renderThemeCategories();
        renderTextThemes();
      });
      wrap.appendChild(button);
    }
  }

  function visibleThemes() {
    return activeThemeCategory === "all"
      ? textThemes
      : textThemes.filter((theme) => theme.category === activeThemeCategory);
  }

  function renderTextThemes() {
    const wrap = $("fontoTextThemes");
    const count = $("fontoTextThemeCount");
    if (!wrap) return;
    const visible = visibleThemes();
    if (count) count.textContent = textThemes.length.toLocaleString("fa-IR") + " تم دوزبانه";
    wrap.replaceChildren();
    if (!visible.length) {
      const message = document.createElement("span");
      message.className = "fonto-library-message";
      message.textContent = "در این دسته تمی وجود ندارد.";
      wrap.appendChild(message);
      return;
    }
    for (const theme of visible) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fonto-template-card fonto-theme-card" + (state.themeId === theme.id ? " active" : "");
      button.dataset.themeId = theme.id;
      button.title = theme.title_fa + " / " + theme.title_en;
      const preview = document.createElement("span");
      preview.className = "fonto-template-preview fonto-theme-preview";
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 190;
      canvas.setAttribute("aria-label", "پیش‌نمایش فارسی و انگلیسی " + theme.title_fa);
      preview.appendChild(canvas);
      const title = document.createElement("small");
      title.className = "fonto-theme-name";
      title.textContent = theme.title_fa + " · " + theme.title_en;
      button.append(preview, title);
      button.addEventListener("click", () => applyTextTheme(theme));
      wrap.appendChild(button);
      renderThemePreview(canvas, theme);
    }
  }

  async function chooseQuickStyle(style) {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      state.quickStyle = style;
      state.quickStyleImage = image;
      if (!state.themeId && /^#[0-9a-f]{6}$/i.test(style.text_color || "")) {
        state.color = style.text_color;
        state.fillStops = [];
        state.gradient = false;
        if ($("fontoColor")) $("fontoColor").value = state.color;
        if ($("fontoGradient")) $("fontoGradient").checked = false;
      }
      renderQuickStyles();
      draw();
    };
    image.onerror = () => status("بارگذاری استایل سریع «" + style.title + "» ناموفق بود.", "bad");
    image.src = style.asset;
  }

  function clearQuickStyle() {
    state.quickStyle = null;
    state.quickStyleImage = null;
    renderQuickStyles();
    draw();
  }

  async function populateQuickStyles() {
    ensureQuickStylesPanel();
    try {
      quickStyles = await getQuickStyles();
      activeQuickCategory = "all";
      renderQuickCategories();
      renderQuickStyles();
    } catch (error) {
      console.error(error);
      const wrap = $("fontoQuickStyles");
      if (wrap) wrap.innerHTML = '<span class="fonto-library-message">استایل‌های سریع در دسترس نیستند.</span>';
      if ($("fontoQuickStyleCount")) $("fontoQuickStyleCount").textContent = "خطا در دریافت";
    }
  }

  async function populateTextThemes() {
    ensureTextThemesPanel();
    try {
      textThemes = await getTextThemes();
      activeThemeCategory = "all";
      renderThemeCategories();
      renderTextThemes();
    } catch (error) {
      console.error(error);
      const wrap = $("fontoTextThemes");
      if (wrap) wrap.innerHTML = '<span class="fonto-library-message">تم‌های متن در دسترس نیستند.</span>';
      if ($("fontoTextThemeCount")) $("fontoTextThemeCount").textContent = "خطا در دریافت";
    }
  }

  function effectNumber(effects, key, fallback) {
    const value = Number(effects?.[key]);
    return Number.isFinite(value) ? value : fallback;
  }

  function effectColor(effects, key, fallback) {
    const value = String(effects?.[key] || "");
    return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
  }

  function normalizeStops(stops) {
    if (!Array.isArray(stops)) return [];
    return stops
      .map((item) => ({
        at: clamp(Number(item?.at), 0, 1),
        color: /^#[0-9a-f]{6}$/i.test(String(item?.color || "")) ? item.color : null,
      }))
      .filter((item) => Number.isFinite(item.at) && item.color)
      .sort((a, b) => a.at - b.at);
  }

  function normalizeOutlines(outlines) {
    if (!Array.isArray(outlines)) return [];
    return outlines
      .map((item) => ({
        color: /^#[0-9a-f]{6}$/i.test(String(item?.color || "")) ? item.color : null,
        width: clamp(Number(item?.width), 0, 20),
      }))
      .filter((item) => item.color && Number.isFinite(item.width) && item.width > 0)
      .sort((a, b) => b.width - a.width);
  }

  function normalizeShadows(shadows) {
    if (!Array.isArray(shadows)) return [];
    return shadows
      .map((item) => ({
        color: /^#[0-9a-f]{6}$/i.test(String(item?.color || "")) ? item.color : null,
        blur: clamp(Number(item?.blur), 0, 40),
        x: clamp(Number(item?.x || 0), -30, 30),
        y: clamp(Number(item?.y || 0), -30, 30),
      }))
      .filter((item) => item.color && Number.isFinite(item.blur));
  }

  function themeStyleFromEffects(effects = {}) {
    const fillStops = normalizeStops(effects.fill_stops);
    const outlineLayers = normalizeOutlines(effects.outlines);
    const shadowLayers = normalizeShadows(effects.shadows);
    return {
      fontWeight: clamp(effectNumber(effects, "font_weight", 900), 300, 900),
      color: effectColor(effects, "color", fillStops[0]?.color || "#ffffff"),
      fillStops,
      gradient: fillStops.length >= 2,
      gradientDirection: ["horizontal", "vertical", "diagonal"].includes(effects.gradient_direction)
        ? effects.gradient_direction
        : "horizontal",
      stroke: outlineLayers[0]?.color || effectColor(effects, "stroke", "#000000"),
      strokeWidth: outlineLayers[0]?.width || clamp(effectNumber(effects, "stroke_width", 0), 0, 20),
      outlineLayers,
      shadow: shadowLayers.length > 0 || effects.shadow === true,
      shadowColor: shadowLayers[0]?.color || effectColor(effects, "shadow_color", "#000000"),
      shadowBlur: shadowLayers[0]?.blur ?? clamp(effectNumber(effects, "shadow_blur", 0), 0, 40),
      shadowOffsetX: shadowLayers[0]?.x ?? effectNumber(effects, "shadow_offset_x", 0),
      shadowOffsetY: shadowLayers[0]?.y ?? effectNumber(effects, "shadow_offset_y", 5),
      shadowLayers,
      depth: clamp(effectNumber(effects, "depth", 0), 0, 14),
      depthColor: effectColor(effects, "depth_color", "#111111"),
      depthOffsetX: effectNumber(effects, "depth_offset_x", 0.55),
      depthOffsetY: effectNumber(effects, "depth_offset_y", 1),
      opacity: clamp(effectNumber(effects, "opacity", 1), 0.2, 1),
    };
  }

  function currentTextStyle() {
    return {
      fontWeight: state.fontWeight,
      color: state.color,
      fillStops: state.fillStops,
      gradient: state.gradient,
      gradientA: state.gradientA,
      gradientB: state.gradientB,
      gradientDirection: state.gradientDirection,
      stroke: state.stroke,
      strokeWidth: state.strokeWidth,
      outlineLayers: state.outlineLayers,
      shadow: state.shadow,
      shadowColor: state.shadowColor,
      shadowBlur: state.shadowBlur,
      shadowOffsetX: state.shadowOffsetX,
      shadowOffsetY: state.shadowOffsetY,
      shadowLayers: state.shadowLayers,
      depth: state.depth,
      depthColor: state.depthColor,
      depthOffsetX: state.depthOffsetX,
      depthOffsetY: state.depthOffsetY,
      opacity: state.opacity,
      textAlign: state.textAlign,
      textDirection: state.textDirection,
      lineHeight: state.lineHeight,
    };
  }

  function createTextFill(ctx, metrics, size, style, centerX = 0) {
    let stops = style.fillStops || [];
    if (stops.length < 2 && style.gradient) {
      stops = [
        { at: 0, color: style.gradientA || "#ffffff" },
        { at: 1, color: style.gradientB || "#18d96b" },
      ];
    }
    if (stops.length < 2) return style.color || "#ffffff";
    const width = Math.max(metrics.width, size * 2);
    let gradient;
    if (style.gradientDirection === "vertical") {
      gradient = ctx.createLinearGradient(centerX, -size * 0.65, centerX, size * 0.65);
    } else if (style.gradientDirection === "diagonal") {
      gradient = ctx.createLinearGradient(centerX - width / 2, -size * 0.6, centerX + width / 2, size * 0.6);
    } else {
      gradient = ctx.createLinearGradient(centerX - width / 2, 0, centerX + width / 2, 0);
    }
    for (const item of stops) gradient.addColorStop(item.at, item.color);
    return gradient;
  }

  const MIN_RENDER_TEXT_SIZE = 1;

  function splitLongToken(ctx, token, maxWidth) {
    const parts = [];
    let current = "";
    for (const character of Array.from(token)) {
      const candidate = current + character;
      if (current && ctx.measureText(candidate).width > maxWidth) {
        parts.push(current);
        current = character;
      } else {
        current = candidate;
      }
    }
    if (current || !parts.length) parts.push(current);
    return parts;
  }

  function wrapParagraph(ctx, paragraph, maxWidth) {
    if (!paragraph) return [""];
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [""];
    const lines = [];
    let current = "";
    for (const word of words) {
      const pieces = ctx.measureText(word).width > maxWidth
        ? splitLongToken(ctx, word, maxWidth)
        : [word];
      for (const piece of pieces) {
        const candidate = current ? current + " " + piece : piece;
        if (current && ctx.measureText(candidate).width > maxWidth) {
          lines.push(current);
          current = piece;
        } else {
          current = candidate;
        }
      }
    }
    if (current || !lines.length) lines.push(current);
    return lines;
  }

  function measureTextLayout(ctx, text, fontFamily, size, fontWeight, maxWidth, lineHeightRatio) {
    ctx.font = fontWeight + " " + size + "px " + fontFamily;
    const paragraphs = String(text ?? "").replace(/\r\n?/g, "\n").split("\n");
    const lines = paragraphs.flatMap((paragraph) => wrapParagraph(ctx, paragraph, maxWidth));
    const widths = lines.map((line) => ctx.measureText(line).width);
    const lineHeight = size * lineHeightRatio;
    return {
      size,
      lines,
      widths,
      width: Math.max(0, ...widths),
      lineHeight,
      height: Math.max(lineHeight, lines.length * lineHeight),
    };
  }

  function fitTextLayout(ctx, text, fontFamily, requestedSize, fontWeight, maxWidth, maxHeight, lineHeightRatio) {
    const requested = Math.max(MIN_RENDER_TEXT_SIZE, Number(requestedSize) || 1);
    let layout = measureTextLayout(ctx, text, fontFamily, requested, fontWeight, maxWidth, lineHeightRatio);
    const fits = (candidate) => candidate.width <= maxWidth + 0.5 && candidate.height <= maxHeight + 0.5;
    if (fits(layout)) return layout;
    let low = MIN_RENDER_TEXT_SIZE;
    let high = requested;
    let best = measureTextLayout(ctx, text, fontFamily, low, fontWeight, maxWidth, lineHeightRatio);
    for (let iteration = 0; iteration < 14; iteration += 1) {
      const middle = (low + high) / 2;
      const candidate = measureTextLayout(ctx, text, fontFamily, middle, fontWeight, maxWidth, lineHeightRatio);
      if (fits(candidate)) {
        best = candidate;
        low = middle;
      } else {
        high = middle;
      }
    }
    return best;
  }

  function paintStyledText(ctx, text, x, y, fontFamily, requestedSize, maxWidth, style, maxHeight = Infinity) {
    ctx.save();
    ctx.translate(x, y);
    const textAlign = ["right", "center", "left"].includes(style.textAlign) ? style.textAlign : "center";
    const textDirection = ["rtl", "ltr"].includes(style.textDirection)
      ? style.textDirection
      : /[\u0600-\u06ff]/.test(text) ? "rtl" : "ltr";
    ctx.textAlign = textAlign;
    ctx.textBaseline = "middle";
    if ("direction" in ctx) ctx.direction = textDirection;
    const layout = fitTextLayout(
      ctx,
      text,
      fontFamily,
      requestedSize,
      style.fontWeight,
      maxWidth,
      maxHeight,
      clamp(Number(style.lineHeight) || 1.18, 1, 2),
    );
    const size = layout.size;
    const lineX = textAlign === "right" ? maxWidth / 2 : textAlign === "left" ? -maxWidth / 2 : 0;
    const fillCenterX = textAlign === "right"
      ? lineX - layout.width / 2
      : textAlign === "left"
        ? lineX + layout.width / 2
        : 0;
    const fill = createTextFill(ctx, { width: layout.width }, size, style, fillCenterX);
    const firstLineY = -((layout.lines.length - 1) * layout.lineHeight) / 2;
    const drawLines = (method, offsetX = 0, offsetY = 0) => {
      layout.lines.forEach((line, index) => {
        ctx[method](line, lineX + offsetX, firstLineY + index * layout.lineHeight + offsetY);
      });
    };
    const outlines = style.outlineLayers?.length
      ? style.outlineLayers
      : style.strokeWidth > 0
        ? [{ color: style.stroke, width: style.strokeWidth }]
        : [];
    const widestOutline = outlines[0];
    const depth = Math.round(style.depth || 0);
    ctx.globalAlpha = style.opacity ?? 1;
    if (depth > 0) {
      ctx.save();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.fillStyle = style.depthColor || "#111111";
      if (widestOutline) {
        ctx.strokeStyle = style.depthColor || widestOutline.color;
        ctx.lineWidth = widestOutline.width;
        ctx.lineJoin = "round";
      }
      for (let layer = depth; layer >= 1; layer -= 1) {
        const offsetX = layer * (style.depthOffsetX ?? 0.55);
        const offsetY = layer * (style.depthOffsetY ?? 1);
        if (widestOutline) drawLines("strokeText", offsetX, offsetY);
        drawLines("fillText", offsetX, offsetY);
      }
      ctx.restore();
    }
    const shadows = style.shadowLayers?.length
      ? style.shadowLayers
      : style.shadow
        ? [{
            color: style.shadowColor || "#000000",
            blur: style.shadowBlur || 0,
            x: style.shadowOffsetX || 0,
            y: style.shadowOffsetY || 0,
          }]
        : [];
    for (const layer of shadows) {
      ctx.save();
      ctx.shadowColor = layer.color;
      ctx.shadowBlur = layer.blur;
      ctx.shadowOffsetX = layer.x;
      ctx.shadowOffsetY = layer.y;
      ctx.fillStyle = fill;
      drawLines("fillText");
      ctx.restore();
    }
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.lineJoin = "round";
    for (const layer of outlines) {
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = layer.width;
      drawLines("strokeText");
    }
    ctx.fillStyle = fill;
    drawLines("fillText");
    ctx.restore();
  }

  function renderThemePreview(canvas, theme) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const effects = theme.effects_json || {};
    const style = themeStyleFromEffects(effects);
    const width = canvas.width;
    const height = canvas.height;
    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, effectColor(effects, "preview_bg_a", "#0b1020"));
    background.addColorStop(1, effectColor(effects, "preview_bg_b", "#27324b"));
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    const family = "Tahoma, Arial, sans-serif";
    paintStyledText(ctx, theme.preview_text_fa || "نمونه فارسی", width / 2, 67, family, 38, width - 30, style);
    paintStyledText(ctx, theme.preview_text_en || "English Style", width / 2, 132, family, 32, width - 30, style);
  }

  function syncEffectControls() {
    if ($("fontoColor")) $("fontoColor").value = state.color;
    if ($("fontoStroke")) $("fontoStroke").value = state.stroke;
    if ($("fontoStrokeWidth")) $("fontoStrokeWidth").value = String(state.strokeWidth);
    if ($("fontoShadow")) $("fontoShadow").checked = state.shadow;
    if ($("fontoShadowBlur")) $("fontoShadowBlur").value = String(state.shadowBlur);
    if ($("fontoGradient")) $("fontoGradient").checked = state.gradient;
    if ($("fontoGradientA")) $("fontoGradientA").value = state.gradientA;
    if ($("fontoGradientB")) $("fontoGradientB").value = state.gradientB;
  }

  function applyTextTheme(theme) {
    const style = themeStyleFromEffects(theme.effects_json || {});
    Object.assign(state, style, {
      themeId: theme.id,
      gradientA: style.fillStops[0]?.color || style.color,
      gradientB: style.fillStops.at(-1)?.color || style.color,
    });
    syncEffectControls();
    renderTextThemes();
    draw();
  }

  function clearActiveThemeForManualEdit(kind) {
    state.themeId = null;
    if (kind === "fill") state.fillStops = [];
    if (kind === "outline") state.outlineLayers = [];
    if (kind === "shadow") state.shadowLayers = [];
    renderTextThemes();
  }

  function resize() {
    const canvas = state.canvas;
    if (!canvas) return;
    const parentWidth = Math.floor(canvas.parentElement.getBoundingClientRect().width);
    const mobile = window.matchMedia("(max-width:760px)").matches;
    const target = mobile ? Math.min(parentWidth, 300) : Math.min(parentWidth, 520);
    const width = Math.max(230, target);
    const height = Math.round((width * 4) / 9);
    const density = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * density;
    canvas.height = height * density;
    canvas.dataset.w = String(width);
    canvas.dataset.h = String(height);
    state.ctx.setTransform(density, 0, 0, density, 0, 0);
    draw();
  }

  function syncStickyCanvasOffset() {
    const nav = document.querySelector(".bottom-nav");
    const navHeight = nav?.getBoundingClientRect().height || 0;
    const top = Math.max(12, Math.round(navHeight + 22));
    document.documentElement.style.setProperty("--fonto-canvas-top", top + "px");
  }

  function syncPreviewBackground() {
    const wrap = state.canvas?.parentElement;
    if (!wrap) return;
    wrap.style.background = state.bg === "transparent"
      ? "repeating-conic-gradient(#d9dce3 0 25%, #f3f4f7 0 50%) 50% / 18px 18px"
      : state.bg;
  }

  async function renderComposition(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);
    if (state.quickStyleImage) {
      const fit = Math.min(
        (width * 0.96) / state.quickStyleImage.width,
        (height * 0.92) / state.quickStyleImage.height,
      );
      const assetWidth = state.quickStyleImage.width * fit;
      const assetHeight = state.quickStyleImage.height * fit;
      ctx.drawImage(
        state.quickStyleImage,
        (width - assetWidth) / 2,
        (height - assetHeight) / 2,
        assetWidth,
        assetHeight,
      );
    }
    let family = state.font;
    try {
      if (state.fontUrl) {
        family = await loadFont({
          id: state.fontId,
          name: state.font,
          url: state.fontUrl,
        });
      }
    } catch (error) {
      console.warn(error);
    }
    ctx.save();
    ctx.translate(state.x * width, state.y * height);
    ctx.rotate((state.rotate * Math.PI) / 180);
    ctx.scale(state.scale, state.scale);
    paintStyledText(
      ctx,
      state.text,
      0,
      0,
      '"' + family + '", Tahoma, Arial, sans-serif',
      state.size,
      (width * 0.92) / Math.max(0.5, state.scale),
      currentTextStyle(),
      (height * 0.84) / Math.max(0.5, state.scale),
    );
    ctx.restore();
  }

  async function draw() {
    const canvas = state.canvas;
    const ctx = state.ctx;
    if (!canvas || !ctx) return;
    const width = Number(canvas.dataset.w) || 300;
    const height = Number(canvas.dataset.h) || 133;
    syncPreviewBackground();
    await renderComposition(ctx, width, height);
  }

  async function createTransparentExportCanvas() {
    const source = state.canvas;
    if (!source) return null;
    const width = Number(source.dataset.w) || 300;
    const height = Number(source.dataset.h) || 133;
    const density = source.width / width || 1;
    const output = document.createElement("canvas");
    output.width = source.width;
    output.height = source.height;
    const ctx = output.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(density, 0, 0, density, 0, 0);
    await renderComposition(ctx, width, height);
    return output;
  }

  function canvasToPngBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  function bind(id, event, handler) {
    $(id)?.addEventListener(event, handler);
  }

  function sizeFromOffset(offset) {
    const value = clamp(Number(offset) || 0, -100, 100);
    if (value < 0) return NORMAL_TEXT_SIZE + (NORMAL_TEXT_SIZE - MIN_TEXT_SIZE) * (value / 100);
    return NORMAL_TEXT_SIZE + (MAX_TEXT_SIZE - NORMAL_TEXT_SIZE) * (value / 100);
  }

  function offsetFromSize(size) {
    const value = clamp(Number(size) || NORMAL_TEXT_SIZE, MIN_TEXT_SIZE, MAX_TEXT_SIZE);
    if (value < NORMAL_TEXT_SIZE) return ((value - NORMAL_TEXT_SIZE) / (NORMAL_TEXT_SIZE - MIN_TEXT_SIZE)) * 100;
    return ((value - NORMAL_TEXT_SIZE) / (MAX_TEXT_SIZE - NORMAL_TEXT_SIZE)) * 100;
  }

  function syncSizeOutput() {
    const output = $("fontoSizeValue");
    if (!output) return;
    const offset = Math.round(offsetFromSize(state.size));
    const mode = offset === 0 ? "نرمال" : offset > 0 ? "+" + offset.toLocaleString("fa-IR") + "٪" : offset.toLocaleString("fa-IR") + "٪";
    output.textContent = mode + " · " + Math.round(state.size).toLocaleString("fa-IR");
  }

  function syncTextLayoutControls() {
    document.querySelectorAll("[data-fonto-align]").forEach((button) => {
      const active = button.dataset.fontoAlign === state.textAlign;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-fonto-direction]").forEach((button) => {
      const active = button.dataset.fontoDirection === state.textDirection;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if ($("fontoText")) $("fontoText").dir = state.textDirection;
  }

  function bindControls() {
    bind("fontoText", "input", (event) => {
      state.text = event.target.value;
      draw();
    });
    bind("fontoSize", "input", (event) => {
      state.size = sizeFromOffset(event.target.value);
      syncSizeOutput();
      draw();
    });
    [
      ["fontoRotate", "rotate"],
      ["fontoX", "x"],
      ["fontoY", "y"],
      ["fontoScale", "scale"],
    ].forEach(([id, key]) => bind(id, "input", (event) => {
      state[key] = Number(event.target.value);
      draw();
    }));

    document.querySelectorAll("[data-fonto-align]").forEach((button) => {
      button.addEventListener("click", () => {
        state.textAlign = button.dataset.fontoAlign;
        syncTextLayoutControls();
        draw();
      });
    });
    document.querySelectorAll("[data-fonto-direction]").forEach((button) => {
      button.addEventListener("click", () => {
        state.textDirection = button.dataset.fontoDirection;
        syncTextLayoutControls();
        draw();
      });
    });

    bind("fontoColor", "input", (event) => {
      state.color = event.target.value;
      state.gradient = false;
      if ($("fontoGradient")) $("fontoGradient").checked = false;
      clearActiveThemeForManualEdit("fill");
      draw();
    });
    bind("fontoStroke", "input", (event) => {
      state.stroke = event.target.value;
      clearActiveThemeForManualEdit("outline");
      draw();
    });
    bind("fontoStrokeWidth", "input", (event) => {
      state.strokeWidth = Number(event.target.value);
      clearActiveThemeForManualEdit("outline");
      draw();
    });
    bind("fontoShadow", "change", (event) => {
      state.shadow = event.target.checked;
      clearActiveThemeForManualEdit("shadow");
      draw();
    });
    bind("fontoShadowBlur", "input", (event) => {
      state.shadowBlur = Number(event.target.value);
      clearActiveThemeForManualEdit("shadow");
      draw();
    });
    bind("fontoGradient", "change", (event) => {
      state.gradient = event.target.checked;
      clearActiveThemeForManualEdit("fill");
      draw();
    });
    bind("fontoGradientA", "input", (event) => {
      state.gradientA = event.target.value;
      state.gradient = true;
      if ($("fontoGradient")) $("fontoGradient").checked = true;
      clearActiveThemeForManualEdit("fill");
      draw();
    });
    bind("fontoGradientB", "input", (event) => {
      state.gradientB = event.target.value;
      state.gradient = true;
      if ($("fontoGradient")) $("fontoGradient").checked = true;
      clearActiveThemeForManualEdit("fill");
      draw();
    });

    document.querySelectorAll("[data-fonto-bg]").forEach((button) => {
      button.addEventListener("click", () => {
        state.bg = button.dataset.fontoBg;
        state.bgImage = null;
        draw();
      });
    });
    bind("fontoBgColor", "input", (event) => {
      state.bg = event.target.value;
      state.bgImage = null;
      draw();
    });
    bind("fontoDownload", "click", async () => {
      const output = await createTransparentExportCanvas();
      if (!output) return;
      const blob = await canvasToPngBlob(output);
      if (!blob) {
        status("ساخت فایل PNG ناموفق بود.", "bad");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "fonto-" + Date.now() + ".png";
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    });
    bind("fontoReset", "click", resetEditor);
    bind("fontoLogout", "click", () => {
      sessionStorage.removeItem(SESSION_KEY);
      location.reload();
    });

    const canvas = $("fontoCanvas");
    let dragging = false;
    if (canvas) {
      canvas.addEventListener("pointerdown", (event) => {
        dragging = true;
        canvas.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      });
      canvas.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        const rect = canvas.getBoundingClientRect();
        state.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        state.y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        syncPositionControls();
        draw();
      });
      const stopDragging = () => {
        dragging = false;
      };
      canvas.addEventListener("pointerup", stopDragging);
      canvas.addEventListener("pointercancel", stopDragging);
    }
  }

  function resetEditor() {
    Object.assign(state, {
      bg: "#1769e0",
      bgImage: null,
      quickStyle: null,
      quickStyleImage: null,
      themeId: null,
      text: "متن خود را بنویسید",
      textAlign: "center",
      textDirection: "rtl",
      lineHeight: 1.18,
      fontWeight: 800,
      size: 44,
      color: "#ffffff",
      fillStops: [],
      gradientDirection: "horizontal",
      stroke: "#000000",
      strokeWidth: 0,
      outlineLayers: [],
      shadow: true,
      shadowBlur: 12,
      shadowColor: "#000000",
      shadowOffsetX: 0,
      shadowOffsetY: 5,
      shadowLayers: [],
      gradient: false,
      gradientA: "#ffffff",
      gradientB: "#18d96b",
      depth: 0,
      depthColor: "#111111",
      depthOffsetX: 0.55,
      depthOffsetY: 1,
      opacity: 1,
      rotate: 0,
      x: 0.5,
      y: 0.5,
      scale: 1,
    });
    if ($("fontoText")) $("fontoText").value = state.text;
    if ($("fontoSize")) $("fontoSize").value = String(offsetFromSize(state.size));
    if ($("fontoBgColor")) $("fontoBgColor").value = state.bg;
    syncSizeOutput();
    syncTextLayoutControls();
    syncEffectControls();
    renderQuickStyles();
    renderTextThemes();
    syncPositionControls();
    draw();
  }

  function syncPositionControls() {
    if ($("fontoX")) $("fontoX").value = String(state.x);
    if ($("fontoY")) $("fontoY").value = String(state.y);
  }

  async function unlock() {
    if (state.unlocked) return;
    state.unlocked = true;
    $("fontoGate")?.classList.add("hidden");
    $("fontoEditor")?.classList.remove("hidden");
    state.canvas = $("fontoCanvas");
    state.ctx = state.canvas?.getContext("2d");
    ensureFontLibraryPanel();
    ensureQuickStylesPanel();
    ensureTextThemesPanel();
    status("در حال دریافت پیش‌نمایش فونت‌ها، استایل‌های سریع و تم‌های متن...", "checking");
    await Promise.allSettled([populateFonts(), populateQuickStyles(), populateTextThemes()]);
    status("ابزار فونت آماده است.", "ok");
    syncSizeOutput();
    syncTextLayoutControls();
    syncStickyCanvasOffset();
    resize();
  }

  function activate() {
    if (hasSession()) return unlock();
    $("fontoGate")?.classList.remove("hidden");
    return Promise.resolve();
  }

  function applyVisibleLabels() {
    const navButton = document.querySelector("button[onclick*=\"'fonto'\"]");
    const sectionTitle = document.querySelector("#fonto > .section-title span:first-child");
    const gateTitle = document.querySelector(".fonto-gate-title");
    if (navButton) navButton.textContent = "ابزار فونت";
    if (sectionTitle) sectionTitle.textContent = "ابزار فونت";
    if (gateTitle) gateTitle.textContent = "ورود به ابزار فونت";
    if ($("fontoLoginBtn")) $("fontoLoginBtn").textContent = "ورود به ابزار فونت";
    if ($("fontoLogout")) $("fontoLogout").textContent = "خروج از ابزار فونت";
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyVisibleLabels();
    bind("fontoLoginBtn", "click", verify);
    bind("fontoPassword", "keydown", (event) => {
      if (event.key === "Enter") verify();
    });
    bindControls();
    window.addEventListener("resize", () => {
      if (!state.unlocked) return;
      syncStickyCanvasOffset();
      resize();
    });
    if (location.hash === "#fonto") activate();
  });

  window.initFonto = activate;
})();
