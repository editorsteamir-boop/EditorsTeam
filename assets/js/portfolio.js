(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const SUPABASE_URL = "https://yxzekduddsewulkbdcoz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB";
  const DEFAULT_AVATAR = "./assets/images/default-avatar.svg";
  let currentEditor = null;
  let currentMedia = [];

  const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

  function inferType(src, explicit) {
    if (explicit === "video" || explicit === "image") return explicit;
    const clean = String(src || "").split("?")[0].toLowerCase();
    return /\.(mp4|webm|mov|m4v|ogg)$/i.test(clean) ? "video" : "image";
  }

  function normalizeMedia(editor) {
    if (Array.isArray(editor.portfolioMedia) && editor.portfolioMedia.length) {
      return editor.portfolioMedia.filter(Boolean).map((item, index) => {
        if (typeof item === "string") return { src:item, type:inferType(item), title:`پروژه ${index + 1}` };
        return { src:String(item.src || ""), type:inferType(item.src, item.type), title:String(item.title || `پروژه ${index + 1}`) };
      }).filter(x => x.src);
    }
    return (Array.isArray(editor.portfolioImages) ? editor.portfolioImages : []).filter(Boolean).map((src, index) => ({
      src:String(src), type:inferType(src), title:`پروژه ${index + 1}`
    }));
  }

  function showToast(text) {
    const t = $("requestToast");
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(window.__portfolioToast);
    window.__portfolioToast = setTimeout(() => t.classList.remove("show"), 1800);
  }

  function renderMedia() {
    const gallery = $("portfolioGallery");
    if (!currentMedia.length) {
      gallery.innerHTML = '<div class="portfolio-empty">هنوز نمونه‌کاری برای این ادیتور ثبت نشده است.</div>';
      return;
    }
    gallery.innerHTML = currentMedia.map((item, index) => {
      const preview = item.type === "video"
        ? `<div class="portfolio-media-preview video-preview" data-open-media="${index}"><video src="${esc(item.src)}#t=0.1" muted playsinline preload="metadata"></video><span class="video-badge">▶</span></div>`
        : `<div class="portfolio-media-preview" data-open-media="${index}"><img class="gallery-img" src="${esc(item.src)}" alt="${esc(item.title)}"></div>`;
      return `<article class="portfolio-item">${preview}<button class="portfolio-request-btn" type="button" data-request-media="${index}" aria-label="درخواست آموزش ${esc(item.title)}">+</button></article>`;
    }).join("");
  }

  async function init() {
    const id = new URLSearchParams(location.search).get("id");
    try {
      const r = await fetch("./data/editors.json", { cache:"no-cache" });
      if (!r.ok) throw new Error("editors unavailable");
      const data = await r.json();
      currentEditor = (Array.isArray(data) ? data : []).find(x => String(x.id) === String(id));
      if (!currentEditor) throw new Error("editor not found");
      $("portfolioName").textContent = currentEditor.fullName || "ادیتور";
      $("portfolioAvatar").src = currentEditor.image || DEFAULT_AVATAR;
      $("portfolioAvatar").onerror = function(){ this.src = DEFAULT_AVATAR; };
      document.title = `نمونه‌کارهای ${currentEditor.fullName || "ادیتور"}`;
      currentMedia = normalizeMedia(currentEditor);
      renderMedia();
    } catch (_) {
      $("portfolioName").textContent = "ادیتور پیدا نشد";
      $("portfolioGallery").innerHTML = '<div class="portfolio-empty">اطلاعات این ادیتور در دسترس نیست.</div>';
    }
  }

  function openMedia(index) {
    const item = currentMedia[index];
    if (!item) return;
    const modal = $("portfolioModal");
    const img = $("portfolioModalImage");
    const video = $("portfolioModalVideo");
    img.hidden = true; video.hidden = true; video.pause(); video.removeAttribute("src");
    if (item.type === "video") {
      video.src = item.src; video.hidden = false; video.load();
    } else {
      img.src = item.src; img.hidden = false;
    }
    modal.hidden = false; modal.classList.add("active");
  }

  function closeMedia() {
    const modal = $("portfolioModal");
    const video = $("portfolioModalVideo");
    modal.classList.remove("active"); modal.hidden = true;
    $("portfolioModalImage").src = "";
    video.pause(); video.removeAttribute("src"); video.load();
  }

  function openRequest(index) {
    const item = currentMedia[index];
    if (!item || !currentEditor) return;
    $("requestMediaIndex").value = String(index);
    $("requestProjectLabel").textContent = `${currentEditor.fullName || "ادیتور"} • ${item.title || `پروژه ${index + 1}`}`;
    $("requestModal").hidden = false;
    setTimeout(() => $("requestFullName").focus(), 50);
  }

  function closeRequest() { $("requestModal").hidden = true; $("requestForm").reset(); }

  async function saveRequest(event) {
    event.preventDefault();
    const index = Number($("requestMediaIndex").value);
    const item = currentMedia[index];
    if (!item || !currentEditor) return;
    const fullName = $("requestFullName").value.trim();
    const phone = $("requestPhone").value.trim();
    if (!fullName || !phone) return;

    const submit = $("requestForm").querySelector('button[type="submit"]');
    const oldText = submit.textContent;
    submit.disabled = true;
    submit.textContent = "در حال ثبت...";
    try {
      const payload = {
        editor_id:String(currentEditor.id || ""),
        editor_name:String(currentEditor.fullName || ""),
        project_name:item.title || `پروژه ${index + 1}`,
        full_name:fullName,
        phone
      };
      const r = await fetch(`${SUPABASE_URL}/rest/v1/training_requests`, {
        method:"POST",
        headers:{
          apikey:SUPABASE_KEY,
          Authorization:`Bearer ${SUPABASE_KEY}`,
          "Content-Type":"application/json",
          Prefer:"return=minimal"
        },
        body:JSON.stringify(payload)
      });
      if (!r.ok) {
        let message = "ثبت درخواست انجام نشد.";
        try { const j = await r.json(); if (j?.message) message = j.message; } catch (_) {}
        throw new Error(message);
      }
      closeRequest();
      showToast("درخواست با موفقیت ثبت شد");
    } catch (err) {
      alert("خطا در ثبت درخواست: " + (err?.message || "اتصال اینترنت را بررسی کنید."));
    } finally {
      submit.disabled = false;
      submit.textContent = oldText;
    }
  }

  document.addEventListener("click", e => {
    const media = e.target.closest("[data-open-media]");
    if (media) { openMedia(Number(media.dataset.openMedia)); return; }
    const req = e.target.closest("[data-request-media]");
    if (req) { openRequest(Number(req.dataset.requestMedia)); return; }
    if (e.target.id === "portfolioModal" || e.target.id === "portfolioClose") closeMedia();
    if (e.target.id === "requestModal" || e.target.id === "requestClose") closeRequest();
  });
  $("requestForm").addEventListener("submit", saveRequest);
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
