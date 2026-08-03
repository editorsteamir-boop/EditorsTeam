(() => {
  "use strict";
  const STORAGE_KEY = "editorsTeam.editors.v1";
  const DEFAULT_AVATAR = "./assets/images/default-avatar.svg";
  let editorsData = [];

  function escapeText(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[char]);
  }
  function safeUrl(value) {
    const url = String(value || "").trim();
    if (!url) return "";
    try { const parsed = new URL(url, window.location.href); return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : ""; }
    catch (_) { return ""; }
  }
  function normalizeImages(images) {
    return (Array.isArray(images) ? images : []).map((item, index) => {
      if (typeof item === "string") return { src: item, alt: `نمونه‌کار ${index + 1}` };
      return { src: String(item?.src || ""), alt: String(item?.alt || `نمونه‌کار ${index + 1}`) };
    }).filter(item => item.src);
  }
  function normalizeEditor(editor, index) {
    return {
      id: String(editor.id || `editor-${Date.now()}-${index}`), fullName: String(editor.fullName || "بدون نام"),
      badge: String(editor.badge || "ادیتور"), age: String(editor.age || "—"), specialty: String(editor.specialty || "—"),
      city: String(editor.city || "—"), bio: String(editor.bio || ""), image: String(editor.image || DEFAULT_AVATAR),
      verified: Boolean(editor.verified), online: Boolean(editor.online), rating: String(editor.rating || "—"),
      projects: String(editor.projects || "۰"), portfolioUrl: safeUrl(editor.portfolioUrl),
      portfolioImages: normalizeImages(editor.portfolioImages), active: editor.active !== false, order: Number(editor.order ?? index + 1)
    };
  }
  async function loadEditors() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { editorsData = JSON.parse(saved).map(normalizeEditor); return; } catch (_) {} }
    try {
      const response = await fetch(`./data/editors.json?v=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("editors.json not found");
      editorsData = (await response.json()).map(normalizeEditor);
    } catch (_) { editorsData = []; }
  }
  function info(icon, label, value) {
    return `<div class="editor-info-item"><span class="editor-info-icon">${icon}</span><span><small>${label}</small><b>${escapeText(value)}</b></span></div>`;
  }
  function renderEditors() {
    const list = document.getElementById("editorsList"); if (!list) return;
    const visible = editorsData.filter(item => item.active).sort((a,b) => a.order - b.order);
    if (!visible.length) { list.innerHTML = '<div class="empty">هنوز ادیتوری ثبت نشده است.</div>'; return; }
    list.innerHTML = visible.map(editor => {
      const hasGallery = editor.portfolioImages.length > 0;
      const portfolio = hasGallery
        ? `<button class="editor-portfolio" type="button" data-editor-portfolio="${escapeText(editor.id)}">مشاهده نمونه‌کارها <span>◀</span></button>`
        : editor.portfolioUrl
          ? `<a class="editor-portfolio" href="${escapeText(editor.portfolioUrl)}" target="_blank" rel="noopener noreferrer">مشاهده نمونه‌کارها <span>◀</span></a>`
          : `<span class="editor-portfolio disabled">نمونه‌کاری ثبت نشده</span>`;
      return `<article class="editor-card">
        <div class="editor-header"><div class="editor-avatar-wrap"><img class="editor-avatar" src="${escapeText(editor.image)}" alt="تصویر ${escapeText(editor.fullName)}" onerror="this.onerror=null;this.src='${DEFAULT_AVATAR}'"><span class="editor-status ${editor.online ? "online" : "offline"}"></span></div>
        <div class="editor-heading"><div class="editor-identity"><h3>${escapeText(editor.fullName)} ${editor.verified ? '<span class="verified" title="عضو تأییدشده">✓</span>' : ''}</h3><p class="editor-badge">${escapeText(editor.badge)}</p></div><div class="editor-score"><span>★ ${escapeText(editor.rating)}</span><small>${escapeText(editor.projects)} پروژه</small></div></div></div>
        <div class="editor-main">${editor.bio ? `<p class="editor-bio">${escapeText(editor.bio)}</p>` : ""}<div class="editor-details">${info("🎂", "سن", editor.age + (editor.age !== "—" ? " سال" : ""))}${info("💼", "حوزه کاری", editor.specialty)}${info("📍", "شهر", editor.city)}</div></div>
        <div class="editor-action">${portfolio}</div></article>`;
    }).join("");
  }
  function openEditorPortfolio(id) {
    const editor = editorsData.find(item => String(item.id) === String(id)); if (!editor) return;
    document.getElementById("editorsHome")?.classList.remove("active");
    document.getElementById("editorPortfolioPage")?.classList.add("active");
    const title = document.getElementById("editorPortfolioTitle"); if (title) title.textContent = `نمونه‌کارهای ${editor.fullName} (جهت بزرگنمایی کلیک کنید)`;
    const gallery = document.getElementById("editorPortfolioGallery"); if (!gallery) return;
    gallery.innerHTML = editor.portfolioImages.map((im,i)=>`<img class="gallery-img" src="${escapeText(im.src)}" alt="${escapeText(im.alt || `${editor.fullName} ${i+1}`)}" data-editor-gallery-image>`).join("") || '<div class="home-note">هنوز تصویری برای نمونه‌کارهای این ادیتور ثبت نشده است.</div>';
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function backEditors() {
    document.getElementById("editorPortfolioPage")?.classList.remove("active");
    document.getElementById("editorsHome")?.classList.add("active");
  }
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-editor-portfolio]"); if (button) openEditorPortfolio(button.dataset.editorPortfolio);
    const image = event.target.closest("[data-editor-gallery-image]"); if (image && window.openImage) window.openImage(image.src);
  });
  async function initializeEditors() { await loadEditors(); renderEditors(); }
  window.renderEditors = renderEditors; window.openEditorPortfolio = openEditorPortfolio; window.backEditors = backEditors;
  window.EditorsStore = { STORAGE_KEY, loadEditors, renderEditors };
  document.addEventListener("DOMContentLoaded", initializeEditors);
})();
