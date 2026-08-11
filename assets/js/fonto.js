/* EditorsTeam Fonto Pro — Supabase fonts, textbox previews, and canvas editor */
(() => {
  "use strict";

  const SUPABASE_URL = "https://yxzekduddsewulkbdcoz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB";
  const SESSION_KEY = "editorsTeam.fonto.access.v2";
  const FONT_CACHE = "editorsTeam-fonto-fonts-v3";

  const $ = (id) => document.getElementById(id);
  const clamp = (number, min, max) => Math.max(min, Math.min(max, number));
  const loadedFonts = new Map();

  const state = {
    unlocked: false,
    canvas: null,
    ctx: null,
    bg: "#1769e0",
    bgImage: null,
    textBoxImage: null,
    textBox: null,
    preset: "none",
    text: "متن خود را بنویسید",
    font: "Tahoma",
    fontUrl: "",
    size: 44,
    color: "#ffffff",
    stroke: "#000000",
    strokeWidth: 0,
    shadow: true,
    shadowBlur: 12,
    gradient: false,
    gradientA: "#ffffff",
    gradientB: "#18d96b",
    rotate: 0,
    x: 0.5,
    y: 0.5,
    scale: 1,
  };

  const PRESETS = [
    ["none", "بدون باکس"],
    ["border", "حاشیه"],
    ["glass", "شیشه‌ای"],
    ["gradient", "گرادیان"],
    ["quote", "نقل‌قول"],
    ["note", "یادداشت"],
    ["banner", "بنر"],
    ["neon", "نئون"],
    ["solid", "ساده"],
  ];

  const CATEGORY_LABELS = {
    all: "همه",
    simple: "ساده",
    quote: "نقل‌قول",
    glass: "شیشه‌ای",
    "3d": "سه‌بعدی",
    neon: "نئون",
    note: "یادداشت",
    brush: "براش",
    separator: "خطوط",
    pixel: "پیکسلی",
    dotted: "نقطه‌ای",
    instagram: "اینستاگرام",
  };

  let textBoxAssets = [];
  let quickStyleAssets = [];
  let activeCategory = "all";

  function status(text, type = "neutral") {
    const element = $("fontoStatus");
    if (!element) return;
    element.textContent = text;
    element.className = `fonto-status ${type}`;
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
    return String(path || "")
      .replace(/^\/+/, "")
      .split("/")
      .map(encodeURIComponent)
      .join("/");
  }

  function publicUrl(bucket, path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    const cleanPath = String(path).replace(new RegExp(`^${bucket}/`), "");
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeStoragePath(cleanPath)}`;
  }

  async function api(table, query) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/json",
      },
    });
    if (!response.ok) throw new Error(`${table} ${response.status}`);
    return response.json();
  }

  async function verify() {
    const input = $("fontoPassword");
    const password = input?.value || "";
    if (!password) {
      status("لطفاً رمز ورود را وارد کنید.", "bad");
      return;
    }

    const button = $("fontoLoginBtn");
    if (button) {
      button.disabled = true;
      button.textContent = "در حال بررسی...";
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_fonto_password`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
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

  async function getFonts() {
    const rows = await api("fonto_fonts", "select=*&is_active=eq.true&order=name.asc");
    return rows
      .map((item) => {
        const file = item.file_url || item.file_name;
        return {
          name: item.name || item.family || file?.replace(/\.(ttf|otf|woff2?)$/i, ""),
          url: publicUrl("fonto-fonts", file),
        };
      })
      .filter((item) => item.name && item.url);
  }

  async function getTextBoxes() {
    const rows = await api(
      "fonto_text_boxes",
      "select=*&is_active=eq.true&order=sort_order.asc,created_at.desc",
    );
    return rows
      .map((item) => ({
        ...item,
        url: publicUrl("fonto-text-boxes", item.image_url),
        preview: publicUrl("fonto-text-boxes", item.preview_url || item.image_url),
      }))
      .filter((item) => item.url && item.preview);
  }

  async function getQuickStyles() {
    const rows = await api(
      "fonto_styles",
      "select=*&is_active=eq.true&order=sort_order.asc,created_at.desc",
    );
    return rows
      .map((item) => {
        const effects = item.effects_json || {};
        const url = publicUrl("fonto-text-boxes", item.preview_url);
        return {
          ...item,
          title: effects.label || `ترند ${Number(item.sort_order || 0).toLocaleString("fa-IR")}`,
          url,
          preview: url,
          text_area: {
            x: 0.5,
            y: 0.5,
            text_color: effects.text_color || "#ffffff",
          },
          source: "quick",
        };
      })
      .filter((item) => item.url && item.preview);
  }

  async function cacheFetch(url) {
    if (!("caches" in window)) return fetch(url);
    const cache = await caches.open(FONT_CACHE);
    const cached = await cache.match(url);
    if (cached) return cached;
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error(`font ${response.status}`);
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

  async function loadFont(name, url) {
    if (!url) return name;
    if (loadedFonts.has(url)) return loadedFonts.get(url);
    const response = await cacheFetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const family = `Fonto_${hash(url)}`;
    const face = new FontFace(family, `url(${objectUrl})`);
    await face.load();
    document.fonts.add(face);
    loadedFonts.set(url, family);
    return family;
  }

  async function populateFonts() {
    const select = $("fontoFont");
    if (!select) return;
    try {
      const fonts = await getFonts();
      select.replaceChildren();
      for (const font of fonts) {
        const option = document.createElement("option");
        option.value = font.name;
        option.textContent = font.name;
        option.dataset.url = font.url;
        select.appendChild(option);
      }
      if (!fonts.length) throw new Error("No active fonts");
      state.font = select.options[0].value;
      state.fontUrl = select.options[0].dataset.url || "";
    } catch (error) {
      console.error(error);
      select.innerHTML = '<option value="Tahoma">Tahoma</option><option value="Arial">Arial</option>';
      state.font = "Tahoma";
      state.fontUrl = "";
    }
  }

  function ensureTextBoxPanel() {
    let panel = $("fontoTextBoxesPanel");
    if (panel) return panel;
    const controls = document.querySelector(".fonto-controls");
    if (!controls) return null;

    panel = document.createElement("section");
    panel.id = "fontoTextBoxesPanel";
    panel.className = "fonto-panel fonto-library-panel";
    panel.innerHTML = `
      <div class="fonto-library-heading">
        <div>
          <h3>باکس‌های آماده</h3>
          <small id="fontoTextBoxCount">در حال دریافت...</small>
        </div>
        <div class="fonto-library-nav" aria-label="پیمایش کتابخانه">
          <button id="fontoTextBoxPrev" type="button" aria-label="قبلی">‹</button>
          <button id="fontoTextBoxNext" type="button" aria-label="بعدی">›</button>
        </div>
      </div>
      <div id="fontoCategoryChips" class="fonto-category-scroll" aria-label="دسته‌بندی باکس‌ها"></div>
      <div id="fontoTextBoxes" class="fonto-asset-scroll" aria-live="polite">
        <span class="fonto-library-message">در حال دریافت پیش‌نمایش‌ها...</span>
      </div>
      <p class="fonto-library-help">برای اضافه‌کردن باکس، روی پیش‌نمایش آن بزنید.</p>
      <button id="fontoClearTextBox" type="button" class="fonto-action fonto-clear-asset">حذف باکس انتخاب‌شده</button>
    `;

    const textPanel = controls.querySelector(".fonto-font-panel") || controls.querySelector(".fonto-panel");
    if (textPanel) textPanel.after(panel);
    else controls.prepend(panel);

    $("fontoTextBoxPrev")?.addEventListener("click", () => {
      $("fontoTextBoxes")?.scrollBy({ left: 280, behavior: "smooth" });
    });
    $("fontoTextBoxNext")?.addEventListener("click", () => {
      $("fontoTextBoxes")?.scrollBy({ left: -280, behavior: "smooth" });
    });
    $("fontoClearTextBox")?.addEventListener("click", () => {
      state.textBox = null;
      state.textBoxImage = null;
      document.querySelectorAll(".fonto-asset-card,.fonto-template-card").forEach((card) => card.classList.remove("active"));
      renderQuickStyles();
      draw();
    });
    return panel;
  }

  function ensurePresetPanel() {
    let panel = $("fontoPresetPanel");
    if (panel) return panel;
    const controls = document.querySelector(".fonto-controls");
    if (!controls) return null;
    panel = document.createElement("section");
    panel.id = "fontoPresetPanel";
    panel.className = "fonto-panel fonto-library-panel fonto-quick-panel";
    panel.innerHTML = `
      <div class="fonto-library-heading">
        <div>
          <h3>استایل‌های سریع</h3>
          <small id="fontoQuickStyleCount">در حال دریافت...</small>
        </div>
        <div class="fonto-library-nav" aria-label="پیمایش استایل‌ها">
          <button id="fontoQuickPrev" type="button" aria-label="قبلی">‹</button>
          <button id="fontoQuickNext" type="button" aria-label="بعدی">›</button>
        </div>
      </div>
      <div id="fontoPresetGrid" class="fonto-template-grid" aria-live="polite">
        <span class="fonto-library-message">در حال دریافت استایل‌های PNG...</span>
      </div>
      <p class="fonto-library-help">۳۰ باکس PNG ترند؛ برای انتخاب، روی هر طرح بزنید.</p>
    `;
    const libraryPanel = ensureTextBoxPanel();
    if (libraryPanel) libraryPanel.after(panel);
    else controls.prepend(panel);
    $("fontoQuickPrev")?.addEventListener("click", () => {
      $("fontoPresetGrid")?.scrollBy({ left: 280, behavior: "smooth" });
    });
    $("fontoQuickNext")?.addEventListener("click", () => {
      $("fontoPresetGrid")?.scrollBy({ left: -280, behavior: "smooth" });
    });
    return panel;
  }

  function renderCategoryChips() {
    const wrap = $("fontoCategoryChips");
    if (!wrap) return;
    const categories = ["all", ...new Set(textBoxAssets.map((item) => item.category).filter(Boolean))];
    wrap.replaceChildren();
    for (const category of categories) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `fonto-category-chip${category === activeCategory ? " active" : ""}`;
      button.textContent = CATEGORY_LABELS[category] || category;
      button.addEventListener("click", () => {
        activeCategory = category;
        renderCategoryChips();
        renderTextBoxes();
      });
      wrap.appendChild(button);
    }
  }

  function renderTextBoxes() {
    const wrap = $("fontoTextBoxes");
    const count = $("fontoTextBoxCount");
    if (!wrap) return;
    const visible = activeCategory === "all"
      ? textBoxAssets
      : textBoxAssets.filter((item) => item.category === activeCategory);

    if (count) count.textContent = `${visible.length} باکس`;
    wrap.replaceChildren();

    if (!visible.length) {
      const message = document.createElement("span");
      message.className = "fonto-library-message";
      message.textContent = "در این دسته باکسی وجود ندارد.";
      wrap.appendChild(message);
      return;
    }

    for (const box of visible) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `fonto-asset-card${state.textBox?.id === box.id ? " active" : ""}`;
      button.dataset.boxId = box.id;
      button.title = box.title || "باکس آماده";

      const preview = document.createElement("span");
      preview.className = "fonto-asset-preview";
      const image = document.createElement("img");
      image.src = box.preview;
      image.alt = box.title || "پیش‌نمایش باکس";
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => preview.classList.add("is-missing"));
      preview.appendChild(image);

      const title = document.createElement("small");
      title.textContent = box.title || CATEGORY_LABELS[box.category] || "باکس آماده";
      button.append(preview, title);
      button.addEventListener("click", () => chooseTextBox(box));
      wrap.appendChild(button);
    }
  }

  function renderQuickStyles() {
    const wrap = $("fontoPresetGrid");
    const count = $("fontoQuickStyleCount");
    if (!wrap) return;
    if (count) count.textContent = `${quickStyleAssets.length.toLocaleString("fa-IR")} استایل PNG`;
    wrap.replaceChildren();

    if (!quickStyleAssets.length) {
      const message = document.createElement("span");
      message.className = "fonto-library-message";
      message.textContent = "استایل PNG در دسترس نیست.";
      wrap.appendChild(message);
      return;
    }

    for (const style of quickStyleAssets) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `fonto-template-card${state.textBox?.id === style.id ? " active" : ""}`;
      button.dataset.styleId = style.id;
      button.title = style.title;

      const preview = document.createElement("span");
      preview.className = "fonto-template-preview";
      const image = document.createElement("img");
      image.src = style.preview;
      image.alt = style.title;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => preview.classList.add("is-missing"));
      preview.appendChild(image);

      const title = document.createElement("small");
      title.textContent = style.title;
      button.append(preview, title);
      button.addEventListener("click", () => chooseTextBox(style));
      wrap.appendChild(button);
    }
  }

  function syncPositionControls() {
    if ($("fontoX")) $("fontoX").value = String(state.x);
    if ($("fontoY")) $("fontoY").value = String(state.y);
  }

  async function chooseTextBox(box) {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      state.preset = "none";
      state.textBox = box;
      state.textBoxImage = image;
      const textArea = box.text_area || {};
      if (Number.isFinite(Number(textArea.x))) state.x = Number(textArea.x) > 1 ? Number(textArea.x) / 720 : Number(textArea.x);
      if (Number.isFinite(Number(textArea.y))) state.y = Number(textArea.y) > 1 ? Number(textArea.y) / 1280 : Number(textArea.y);
      if (/^#[0-9a-f]{6}$/i.test(textArea.text_color || "")) {
        state.color = textArea.text_color;
        if ($("fontoColor")) $("fontoColor").value = state.color;
      }
      syncPositionControls();
      renderTextBoxes();
      renderQuickStyles();
      draw();
    };
    image.onerror = () => status(`بارگذاری باکس «${box.title || ""}» ناموفق بود.`, "bad");
    image.src = box.url;
  }

  async function populateTextBoxes() {
    ensureTextBoxPanel();
    try {
      textBoxAssets = await getTextBoxes();
      activeCategory = "all";
      renderCategoryChips();
      renderTextBoxes();
    } catch (error) {
      console.error(error);
      const wrap = $("fontoTextBoxes");
      if (wrap) wrap.innerHTML = '<span class="fonto-library-message">کتابخانه در دسترس نیست؛ دوباره تلاش کنید.</span>';
      const count = $("fontoTextBoxCount");
      if (count) count.textContent = "خطا در دریافت";
    }
  }

  async function populateQuickStyles() {
    ensurePresetPanel();
    try {
      quickStyleAssets = await getQuickStyles();
      renderQuickStyles();
    } catch (error) {
      console.error(error);
      const wrap = $("fontoPresetGrid");
      if (wrap) wrap.innerHTML = '<span class="fonto-library-message">استایل‌های سریع در دسترس نیستند.</span>';
      const count = $("fontoQuickStyleCount");
      if (count) count.textContent = "خطا در دریافت";
    }
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function drawPreset(ctx, kind, textWidth, size) {
    if (kind === "none") return;
    const paddingX = Math.max(28, size * 0.42);
    const paddingY = Math.max(18, size * 0.24);
    const width = Math.min(textWidth + paddingX * 2, 620);
    const height = size + paddingY * 2;
    const x = -width / 2;
    const y = -height / 2;
    const radius = Math.max(10, size * 0.16);

    ctx.save();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    roundRect(ctx, x, y, width, height, radius);

    if (kind === "border") {
      ctx.strokeStyle = "rgba(255,255,255,.92)";
      ctx.lineWidth = Math.max(2, size * 0.035);
      ctx.stroke();
    } else if (kind === "glass") {
      ctx.fillStyle = "rgba(255,255,255,.18)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.42)";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (kind === "gradient") {
      const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
      gradient.addColorStop(0, "#7c3aed");
      gradient.addColorStop(1, "#06b6d4");
      ctx.fillStyle = gradient;
      ctx.fill();
    } else if (kind === "quote") {
      ctx.fillStyle = "rgba(10,12,22,.72)";
      ctx.fill();
      ctx.font = `700 ${Math.max(34, size * 0.55)}px Georgia`;
      ctx.fillStyle = "rgba(255,255,255,.8)";
      ctx.fillText("“", x + 28, y + 28);
    } else if (kind === "note") {
      ctx.fillStyle = "#fff59d";
      ctx.fill();
      ctx.strokeStyle = "#efd94e";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (kind === "banner") {
      ctx.fillStyle = "rgba(0,0,0,.68)";
      ctx.fill();
    } else if (kind === "neon") {
      ctx.fillStyle = "#070b18";
      ctx.fill();
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#22d3ee";
      ctx.shadowBlur = 16;
      ctx.stroke();
    } else if (kind === "solid") {
      ctx.fillStyle = "rgba(255,255,255,.2)";
      ctx.fill();
    }
    ctx.restore();
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

  function syncStickyComposerOffset() {
    const nav = document.querySelector(".bottom-nav");
    const navHeight = nav?.getBoundingClientRect().height || 0;
    const top = Math.max(12, Math.round(navHeight + 20));
    document.documentElement.style.setProperty("--fonto-composer-top", `${top}px`);
  }

  async function draw() {
    const canvas = state.canvas;
    const ctx = state.ctx;
    if (!canvas || !ctx) return;
    const width = Number(canvas.dataset.w) || 300;
    const height = Number(canvas.dataset.h) || 133;
    ctx.clearRect(0, 0, width, height);

    if (state.bgImage) {
      ctx.drawImage(state.bgImage, 0, 0, width, height);
    } else if (state.bg !== "transparent") {
      ctx.fillStyle = state.bg;
      ctx.fillRect(0, 0, width, height);
    }

    if (state.textBoxImage) {
      const fit = Math.min((width * 0.96) / state.textBoxImage.width, (height * 0.92) / state.textBoxImage.height);
      const boxWidth = state.textBoxImage.width * fit;
      const boxHeight = state.textBoxImage.height * fit;
      ctx.drawImage(
        state.textBoxImage,
        (width - boxWidth) / 2,
        (height - boxHeight) / 2,
        boxWidth,
        boxHeight,
      );
    }

    let family = state.font;
    try {
      if (state.fontUrl) family = await loadFont(state.font, state.fontUrl);
    } catch (error) {
      console.warn(error);
    }

    ctx.save();
    ctx.translate(state.x * width, state.y * height);
    ctx.rotate((state.rotate * Math.PI) / 180);
    ctx.scale(state.scale, state.scale);
    ctx.font = `800 ${state.size}px "${family}",Tahoma,Arial,sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const metrics = ctx.measureText(state.text);
    drawPreset(ctx, state.preset, metrics.width, state.size);

    if (state.shadow) {
      ctx.shadowColor = "#000000";
      ctx.shadowBlur = state.shadowBlur;
      ctx.shadowOffsetY = 5;
    }
    if (state.strokeWidth) {
      ctx.lineWidth = state.strokeWidth;
      ctx.strokeStyle = state.stroke;
      ctx.strokeText(state.text, 0, 0);
    }
    if (state.gradient) {
      const gradient = ctx.createLinearGradient(-metrics.width / 2, 0, metrics.width / 2, 0);
      gradient.addColorStop(0, state.gradientA);
      gradient.addColorStop(1, state.gradientB);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = state.preset === "note" ? "#171717" : state.color;
    }
    ctx.fillText(state.text, 0, 0);
    ctx.restore();
  }

  function bind(id, event, handler) {
    $(id)?.addEventListener(event, handler);
  }

  function bindControls() {
    bind("fontoText", "input", (event) => {
      state.text = event.target.value;
      draw();
    });
    bind("fontoFont", "change", async (event) => {
      const option = event.target.selectedOptions[0];
      state.font = option.value;
      state.fontUrl = option.dataset.url || "";
      try {
        await loadFont(state.font, state.fontUrl);
      } catch {}
      draw();
    });

    [
      ["fontoSize", "size"],
      ["fontoStrokeWidth", "strokeWidth"],
      ["fontoShadowBlur", "shadowBlur"],
      ["fontoRotate", "rotate"],
      ["fontoX", "x"],
      ["fontoY", "y"],
      ["fontoScale", "scale"],
    ].forEach(([id, key]) => bind(id, "input", (event) => {
      state[key] = Number(event.target.value);
      draw();
    }));

    [
      ["fontoColor", "color"],
      ["fontoStroke", "stroke"],
      ["fontoGradientA", "gradientA"],
      ["fontoGradientB", "gradientB"],
    ].forEach(([id, key]) => bind(id, "input", (event) => {
      state[key] = event.target.value;
      draw();
    }));

    bind("fontoShadow", "change", (event) => {
      state.shadow = event.target.checked;
      draw();
    });
    bind("fontoGradient", "change", (event) => {
      state.gradient = event.target.checked;
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
    bind("fontoBgImage", "change", (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const image = new Image();
      image.onload = () => {
        state.bgImage = image;
        state.bg = "image";
        draw();
      };
      image.src = URL.createObjectURL(file);
    });

    bind("fontoDownload", "click", async () => {
      await draw();
      const link = document.createElement("a");
      link.download = `fonto-${Date.now()}.png`;
      link.href = state.canvas.toDataURL("image/png");
      link.click();
    });

    bind("fontoReset", "click", () => {
      Object.assign(state, {
        bg: "#1769e0",
        bgImage: null,
        textBox: null,
        textBoxImage: null,
        preset: "none",
        text: "متن خود را بنویسید",
        size: 44,
        color: "#ffffff",
        stroke: "#000000",
        strokeWidth: 0,
        shadow: true,
        shadowBlur: 12,
        gradient: false,
        rotate: 0,
        x: 0.5,
        y: 0.5,
        scale: 1,
      });
      if ($("fontoText")) $("fontoText").value = state.text;
      if ($("fontoSize")) $("fontoSize").value = String(state.size);
      if ($("fontoColor")) $("fontoColor").value = state.color;
      if ($("fontoBgColor")) $("fontoBgColor").value = state.bg;
      renderTextBoxes();
      renderQuickStyles();
      syncPositionControls();
      draw();
    });

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

  async function unlock() {
    if (state.unlocked) return;
    state.unlocked = true;
    $("fontoGate")?.classList.add("hidden");
    $("fontoEditor")?.classList.remove("hidden");
    state.canvas = $("fontoCanvas");
    state.ctx = state.canvas?.getContext("2d");
    ensureTextBoxPanel();
    ensurePresetPanel();
    status("در حال دریافت دارایی‌های ابزار فونت...", "checking");
    await Promise.allSettled([populateFonts(), populateTextBoxes(), populateQuickStyles()]);
    status("ابزار فونت آماده است.", "ok");
    syncStickyComposerOffset();
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
      syncStickyComposerOffset();
      resize();
    });
    if (location.hash === "#fonto") activate();
  });

  window.initFonto = activate;
})();
