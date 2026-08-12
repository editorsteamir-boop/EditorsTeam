/* EditorsTeam Fonto — Supabase fonts, real Fonto text styles, and canvas editor */
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
    styleId: null,
    preset: "none",
    text: "متن خود را بنویسید",
    font: "Tahoma",
    fontUrl: "",
    fontWeight: 800,
    size: 44,
    color: "#ffffff",
    stroke: "#000000",
    strokeWidth: 0,
    shadow: true,
    shadowBlur: 12,
    shadowColor: "#000000",
    shadowOffsetX: 0,
    shadowOffsetY: 5,
    gradient: false,
    gradientA: "#ffffff",
    gradientB: "#18d96b",
    depth: 0,
    depthColor: "#111111",
    opacity: 1,
    rotate: 0,
    x: 0.5,
    y: 0.5,
    scale: 1,
  };

  let textStyles = [];

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
    return String(path || "")
      .replace(/^\/+/, "")
      .split("/")
      .map(encodeURIComponent)
      .join("/");
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

  async function getTextStyles() {
    const rows = await api(
      "fonto_styles",
      "select=*&is_active=eq.true&order=sort_order.asc,created_at.asc",
    );
    return rows
      .map((item) => {
        const effects = item.effects_json || {};
        return {
          ...item,
          effects,
          title: effects.label || item.name || "استایل فونتو",
          preview: publicUrl("fonto-text-boxes", item.preview_url),
        };
      })
      .filter((item) => item.preview);
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

  async function loadFont(name, url) {
    if (!url) return name;
    if (loadedFonts.has(url)) return loadedFonts.get(url);
    const response = await cacheFetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const family = "Fonto_" + hash(url);
    const face = new FontFace(family, "url(" + objectUrl + ")");
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

  function ensureTextStylesPanel() {
    let panel = $("fontoTextStylesPanel");
    if (panel) return panel;
    const controls = document.querySelector(".fonto-controls");
    if (!controls) return null;

    panel = document.createElement("section");
    panel.id = "fontoTextStylesPanel";
    panel.className = "fonto-panel fonto-library-panel fonto-style-panel";
    panel.innerHTML =
      '<div class="fonto-library-heading">' +
        "<div>" +
          "<h3>استایل‌های متن فونتو</h3>" +
          '<small id="fontoTextStyleCount">در حال دریافت...</small>' +
        "</div>" +
        '<div class="fonto-library-nav" aria-label="پیمایش استایل‌های متن">' +
          '<button id="fontoStylePrev" type="button" aria-label="قبلی">‹</button>' +
          '<button id="fontoStyleNext" type="button" aria-label="بعدی">›</button>' +
        "</div>" +
      "</div>" +
      '<div id="fontoTextStyles" class="fonto-template-grid" aria-live="polite">' +
        '<span class="fonto-library-message">در حال دریافت پیش‌نمایش استایل‌ها...</span>' +
      "</div>" +
      '<p class="fonto-library-help">با انتخاب هر پیش‌نمایش، همان افکت روی متن فعلی اعمال می‌شود.</p>';

    const fontPanel = controls.querySelector(".fonto-font-panel");
    if (fontPanel) fontPanel.after(panel);
    else controls.prepend(panel);

    $("fontoStylePrev")?.addEventListener("click", () => {
      $("fontoTextStyles")?.scrollBy({ left: 300, behavior: "smooth" });
    });
    $("fontoStyleNext")?.addEventListener("click", () => {
      $("fontoTextStyles")?.scrollBy({ left: -300, behavior: "smooth" });
    });
    return panel;
  }

  function renderTextStyles() {
    const wrap = $("fontoTextStyles");
    const count = $("fontoTextStyleCount");
    if (!wrap) return;
    if (count) count.textContent = textStyles.length.toLocaleString("fa-IR") + " استایل واقعی";
    wrap.replaceChildren();

    if (!textStyles.length) {
      const message = document.createElement("span");
      message.className = "fonto-library-message";
      message.textContent = "استایل متن در دسترس نیست.";
      wrap.appendChild(message);
      return;
    }

    for (const style of textStyles) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fonto-template-card" + (state.styleId === style.id ? " active" : "");
      button.dataset.styleId = style.id;
      button.title = style.title;

      const preview = document.createElement("span");
      preview.className = "fonto-template-preview";
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
      button.addEventListener("click", () => applyTextStyle(style));
      wrap.appendChild(button);
    }
  }

  function effectNumber(effects, key, fallback) {
    const value = Number(effects[key]);
    return Number.isFinite(value) ? value : fallback;
  }

  function effectColor(effects, key, fallback) {
    const value = String(effects[key] || "");
    return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
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

  function applyTextStyle(style) {
    const effects = style.effects || {};
    Object.assign(state, {
      styleId: style.id,
      preset: effects.preset || "none",
      fontWeight: effectNumber(effects, "font_weight", 800),
      color: effectColor(effects, "color", "#ffffff"),
      stroke: effectColor(effects, "stroke", "#000000"),
      strokeWidth: clamp(effectNumber(effects, "stroke_width", 0), 0, 20),
      shadow: effects.shadow === true,
      shadowBlur: clamp(effectNumber(effects, "shadow_blur", 0), 0, 40),
      shadowColor: effectColor(effects, "shadow_color", "#000000"),
      shadowOffsetX: effectNumber(effects, "shadow_offset_x", 0),
      shadowOffsetY: effectNumber(effects, "shadow_offset_y", 5),
      gradient: effects.gradient === true,
      gradientA: effectColor(effects, "gradient_a", "#ffffff"),
      gradientB: effectColor(effects, "gradient_b", "#18d96b"),
      depth: clamp(effectNumber(effects, "depth", 0), 0, 14),
      depthColor: effectColor(effects, "depth_color", "#111111"),
      opacity: clamp(effectNumber(effects, "opacity", 1), 0.2, 1),
    });
    syncEffectControls();
    renderTextStyles();
    draw();
  }

  async function populateTextStyles() {
    ensureTextStylesPanel();
    try {
      textStyles = await getTextStyles();
      renderTextStyles();
    } catch (error) {
      console.error(error);
      const wrap = $("fontoTextStyles");
      if (wrap) {
        wrap.innerHTML = '<span class="fonto-library-message">استایل‌های متن در دسترس نیستند.</span>';
      }
      const count = $("fontoTextStyleCount");
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
    const paddingY = Math.max(16, size * 0.22);
    const width = Math.min(textWidth + paddingX * 2, 620);
    const height = size + paddingY * 2;
    const x = -width / 2;
    const y = -height / 2;
    const radius = Math.max(10, size * 0.18);

    ctx.save();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    roundRect(ctx, x, y, width, height, radius);

    if (kind === "gradient-label") {
      const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
      gradient.addColorStop(0, "#f725e9");
      gradient.addColorStop(1, "#12cde8");
      ctx.shadowColor = "rgba(0,0,0,.35)";
      ctx.shadowBlur = 7;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = gradient;
      ctx.fill();
    } else if (kind === "gold-label") {
      const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
      gradient.addColorStop(0, "#fff45c");
      gradient.addColorStop(1, "#f2a900");
      ctx.shadowColor = "rgba(0,0,0,.42)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 7;
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = "#fff2a6";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (kind === "shadow-box") {
      ctx.shadowColor = "#ff4338";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = "#1d3485";
      ctx.fill();
    } else if (kind === "modern-box") {
      ctx.shadowColor = "rgba(0,0,0,.45)";
      ctx.shadowBlur = 7;
      ctx.shadowOffsetX = -6;
      ctx.shadowOffsetY = 7;
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    } else if (kind === "rounded-box") {
      ctx.shadowColor = "rgba(0,0,0,.42)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 7;
      ctx.fillStyle = "#ffe629";
      ctx.fill();
    } else if (kind === "quote-yellow") {
      ctx.fillStyle = "#ffdf2c";
      ctx.fill();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = "#111111";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "700 " + Math.max(26, size * 0.45) + "px Georgia";
      ctx.fillStyle = "#111111";
      ctx.fillText("”", x + 24, y + height - 8);
    } else if (kind === "question-box") {
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#111111";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 24, y + height);
      ctx.lineTo(x + 37, y + height + 13);
      ctx.lineTo(x + 47, y + height);
      ctx.closePath();
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.stroke();
    } else if (kind === "cover-label") {
      ctx.fillStyle = "rgba(10, 14, 30, .58)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.38)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (kind === "border") {
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

  function syncStickyCanvasOffset() {
    const nav = document.querySelector(".bottom-nav");
    const navHeight = nav?.getBoundingClientRect().height || 0;
    const top = Math.max(12, Math.round(navHeight + 22));
    document.documentElement.style.setProperty("--fonto-canvas-top", top + "px");
  }

  function setMainTextFill(ctx, metrics) {
    if (state.gradient) {
      const gradient = ctx.createLinearGradient(-metrics.width / 2, 0, metrics.width / 2, 0);
      gradient.addColorStop(0, state.gradientA);
      gradient.addColorStop(1, state.gradientB);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = state.preset === "note" ? "#171717" : state.color;
    }
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
    ctx.globalAlpha = state.opacity;
    ctx.font = state.fontWeight + " " + state.size + 'px "' + family + '",Tahoma,Arial,sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const metrics = ctx.measureText(state.text);
    drawPreset(ctx, state.preset, metrics.width, state.size);

    const depth = Math.round(state.depth);
    if (depth > 0) {
      ctx.save();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.fillStyle = state.depthColor;
      ctx.strokeStyle = state.depthColor;
      ctx.lineWidth = Math.max(state.strokeWidth, 1);
      for (let layer = depth; layer >= 1; layer -= 1) {
        const offsetX = layer * 0.55;
        const offsetY = layer;
        if (state.strokeWidth) ctx.strokeText(state.text, offsetX, offsetY);
        ctx.fillText(state.text, offsetX, offsetY);
      }
      ctx.restore();
    }

    if (state.shadow) {
      ctx.shadowColor = state.shadowColor;
      ctx.shadowBlur = state.shadowBlur;
      ctx.shadowOffsetX = state.shadowOffsetX;
      ctx.shadowOffsetY = state.shadowOffsetY;
    }
    if (state.strokeWidth) {
      ctx.lineWidth = state.strokeWidth;
      ctx.lineJoin = "round";
      ctx.strokeStyle = state.stroke;
      ctx.strokeText(state.text, 0, 0);
    }
    setMainTextFill(ctx, metrics);
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
      link.download = "fonto-" + Date.now() + ".png";
      link.href = state.canvas.toDataURL("image/png");
      link.click();
    });

    bind("fontoReset", "click", () => {
      Object.assign(state, {
        bg: "#1769e0",
        bgImage: null,
        styleId: null,
        preset: "none",
        text: "متن خود را بنویسید",
        fontWeight: 800,
        size: 44,
        color: "#ffffff",
        stroke: "#000000",
        strokeWidth: 0,
        shadow: true,
        shadowBlur: 12,
        shadowColor: "#000000",
        shadowOffsetX: 0,
        shadowOffsetY: 5,
        gradient: false,
        gradientA: "#ffffff",
        gradientB: "#18d96b",
        depth: 0,
        depthColor: "#111111",
        opacity: 1,
        rotate: 0,
        x: 0.5,
        y: 0.5,
        scale: 1,
      });
      if ($("fontoText")) $("fontoText").value = state.text;
      if ($("fontoSize")) $("fontoSize").value = String(state.size);
      if ($("fontoBgColor")) $("fontoBgColor").value = state.bg;
      syncEffectControls();
      renderTextStyles();
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
    ensureTextStylesPanel();
    status("در حال دریافت فونت‌ها و استایل‌های اصلی فونتو...", "checking");
    await Promise.allSettled([populateFonts(), populateTextStyles()]);
    status("ابزار فونت آماده است.", "ok");
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
