import { uploadTextBoxAsset } from './AdminController.js';

export function mountAdminPanel(root) {
  if (!root) return;

  root.innerHTML = `
    <section class="fonto-admin-panel">
      <h2>Fonto Admin</h2>
      <input id="adminTitle" placeholder="عنوان تکس‌باکس" />
      <input id="adminCategory" placeholder="دسته‌بندی" />
      <input id="adminFile" type="file" accept="image/png" />
      <button id="adminUpload">آپلود PNG</button>
      <p id="adminMessage"></p>
    </section>
  `;

  root.querySelector('#adminUpload')?.addEventListener('click', async () => {
    const file = root.querySelector('#adminFile')?.files?.[0];
    const title = root.querySelector('#adminTitle')?.value;
    const category = root.querySelector('#adminCategory')?.value;
    const message = root.querySelector('#adminMessage');

    if (!file) {
      message.textContent = 'فایل PNG انتخاب نشده است.';
      return;
    }

    try {
      await uploadTextBoxAsset({ file, title, category });
      message.textContent = 'تکس‌باکس با موفقیت اضافه شد.';
    } catch (error) {
      console.error(error);
      message.textContent = 'خطا در آپلود.';
    }
  });
}
