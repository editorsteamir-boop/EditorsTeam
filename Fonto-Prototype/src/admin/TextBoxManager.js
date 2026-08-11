import { uploadAsset, createTextBox } from '../services/admin.js';

export function createTextBoxManager({ form, list, getFields }) {
  async function refresh() {
    if (!list) return;
    list.textContent = 'لیست از Supabase در حال دریافت است...';
  }

  async function submit() {
    const { title, category, file } = getFields();
    if (!file) throw new Error('PNG انتخاب نشده');

    const path = `${category || 'general'}/${Date.now()}-${file.name}`;
    const imageUrl = await uploadAsset('fonto-text-boxes', path, file);

    await createTextBox({
      title,
      category,
      image_url: imageUrl,
      preview_url: imageUrl,
      is_active: true,
      sort_order: 0,
      text_area: {}
    });

    await refresh();
    return imageUrl;
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await submit();
  });

  return { refresh, submit };
}
