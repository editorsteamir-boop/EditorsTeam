import { uploadAsset, createTextBox } from '../services/admin.js';

export async function uploadTextBox({ title, category, file, previewUrl = '', textArea = {} }) {
  if (!file) throw new Error('PNG file is required');

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  const path = `${category || 'general'}/${Date.now()}-${safeName}`;

  const imageUrl = await uploadAsset('fonto-text-boxes', path, file);

  const result = await createTextBox({
    title,
    category: category || 'general',
    image_url: imageUrl,
    preview_url: previewUrl,
    text_area: textArea,
    is_active: true,
  });

  return result;
}
