export function renderAdminPanel(container, handlers = {}) {
  if (!container) return;

  container.innerHTML = `
    <div class="fonto-admin-card">
      <h2>مدیریت فونتو</h2>
      <div class="fonto-admin-field">
        <label>عنوان Text Box</label>
        <input id="adminBoxTitle" placeholder="مثلاً Glass Premium">
      </div>
      <div class="fonto-admin-field">
        <label>دسته‌بندی</label>
        <input id="adminBoxCategory" placeholder="glass">
      </div>
      <div class="fonto-admin-field">
        <label>فایل PNG</label>
        <input id="adminBoxFile" type="file" accept="image/png">
      </div>
      <button id="adminUploadBox">آپلود Text Box</button>
      <div id="adminMessage"></div>
    </div>
  `;

  document.getElementById('adminUploadBox')?.addEventListener('click', async () => {
    const file = document.getElementById('adminBoxFile')?.files?.[0];
    const title = document.getElementById('adminBoxTitle')?.value;
    const category = document.getElementById('adminBoxCategory')?.value;

    if (!file) return;

    try {
      await handlers.uploadTextBox?.({ file, title, category });
      document.getElementById('adminMessage').textContent = 'آپلود موفق بود.';
    } catch (e) {
      document.getElementById('adminMessage').textContent = 'خطا در آپلود.';
    }
  });
}
