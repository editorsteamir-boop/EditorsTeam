import { uploadAsset, createTextBox } from '../services/admin.js';

export async function uploadTextBoxFromForm({ file, title, category, previewUrl = '', textArea = {} }) {
  if (!file) throw new Error('PNG file required');

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const path = `${category || 'general'}/${safeName}`;

  const imageUrl = await uploadAsset('fonto-text-boxes', path, file);

  const result = await createTextBox({
    title,
    category: category || 'general',
    image_url: imageUrl,
    preview_url: previewUrl,
    text_area: textArea,
    is_active: true,
    sort_order: 0,
  });

  return result;
}

export function bindAdminUpload(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = form.querySelector('[name=file]')?.files?.[0];
    const title = form.querySelector('[name=title]')?.value || 'Untitled';
    const category = form.querySelector('[name=category]')?.value || 'general';

    await uploadTextBoxFromForm({ file, title, category });
    form.reset();
  });
}
