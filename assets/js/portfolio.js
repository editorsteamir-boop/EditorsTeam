(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const REQUESTS_KEY = "editorsTeam.trainingRequests.v1";
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

  function saveRequest(event) {
    event.preventDefault();
    const index = Number($("requestMediaIndex").value);
    const item = currentMedia[index];
    if (!item || !currentEditor) return;
    const request = {
      id:`req-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      fullName:$("requestFullName").value.trim(),
      phone:$("requestPhone").value.trim(),
      editorId:String(currentEditor.id || ""),
      editorName:String(currentEditor.fullName || ""),
      mediaIndex:index,
      mediaTitle:item.title || `پروژه ${index + 1}`,
      mediaSrc:item.src,
      createdAt:new Date().toISOString()
    };
    let requests = [];
    try { requests = JSON.parse(localStorage.getItem(REQUESTS_KEY) || "[]"); if (!Array.isArray(requests)) requests = []; } catch (_) { requests = []; }
    requests.unshift(request);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    closeRequest();
    showToast("درخواست با موفقیت ثبت شد");
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
