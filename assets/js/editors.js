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
    try {
      const parsed = new URL(url, window.location.href);
      return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
    } catch (_) { return ""; }
  }

  function normalizeEditor(editor, index) {
    return {
      id: String(editor.id || `editor-${Date.now()}-${index}`),
      fullName: String(editor.fullName || "بدون نام"),
      badge: String(editor.badge || "ادیتور"),
      age: String(editor.age || "—"),
      specialty: String(editor.specialty || "—"),
      city: String(editor.city || "—"),
      bio: String(editor.bio || ""),
      image: String(editor.image || DEFAULT_AVATAR),
      verified: Boolean(editor.verified),
      online: Boolean(editor.online),
      rating: String(editor.rating || "—"),
      projects: String(editor.projects || "۰"),
      portfolioUrl: safeUrl(editor.portfolioUrl),
      active: editor.active !== false,
      order: Number(editor.order ?? index + 1)
    };
  }

  async function loadEditors() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { editorsData = JSON.parse(saved).map(normalizeEditor); return; } catch (_) {}
    }
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
    const list = document.getElementById("editorsList");
    if (!list) return;
    const visible = editorsData.filter(item => item.active).sort((a,b) => a.order - b.order);
    if (!visible.length) {
      list.innerHTML = '<div class="empty">هنوز ادیتوری ثبت نشده است.</div>';
      return;
    }
    list.innerHTML = visible.map(editor => {
      const portfolio = editor.portfolioUrl
        ? `<a class="editor-portfolio" href="${escapeText(editor.portfolioUrl)}" target="_blank" rel="noopener noreferrer">مشاهده نمونه‌کارها <span>◀</span></a>`
        : `<span class="editor-portfolio disabled">نمونه‌کاری ثبت نشده</span>`;
      return `<article class="editor-card">
        <div class="editor-avatar-wrap">
          <img class="editor-avatar" src="${escapeText(editor.image)}" alt="تصویر ${escapeText(editor.fullName)}" onerror="this.onerror=null;this.src='${DEFAULT_AVATAR}'">
          <span class="editor-status ${editor.online ? "online" : "offline"}" title="${editor.online ? "آنلاین" : "آفلاین"}"></span>
        </div>
        <div class="editor-main">
          <div class="editor-heading">
            <div><h3>${escapeText(editor.fullName)} ${editor.verified ? '<span class="verified" title="عضو تأییدشده">✓</span>' : ''}</h3><p class="editor-badge">${escapeText(editor.badge)}</p></div>
            <div class="editor-score"><span>★ ${escapeText(editor.rating)}</span><small>${escapeText(editor.projects)} پروژه</small></div>
          </div>
          ${editor.bio ? `<p class="editor-bio">${escapeText(editor.bio)}</p>` : ""}
          <div class="editor-details">
            ${info("🎂", "سن", editor.age + (editor.age !== "—" ? " سال" : ""))}
            ${info("💼", "حوزه کاری", editor.specialty)}
            ${info("📍", "شهر", editor.city)}
          </div>
        </div>
        <div class="editor-action">${portfolio}</div>
      </article>`;
    }).join("");
  }

  async function initializeEditors() { await loadEditors(); renderEditors(); }
  window.renderEditors = renderEditors;
  window.EditorsStore = { STORAGE_KEY, loadEditors, renderEditors };
  document.addEventListener("DOMContentLoaded", initializeEditors);
})();
