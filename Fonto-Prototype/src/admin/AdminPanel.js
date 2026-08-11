import { uploadAsset, createTextBox } from '../services/admin.js';

export async function uploadTextBoxAsset({ file, title, category = 'default' }) {
  const filePath = `${category}/${Date.now()}-${file.name}`;

  const url = await uploadAsset('fonto-text-boxes', filePath, file);

  return createTextBox({
    title,
    category,
    image_url: filePath,
    preview_url: url,
    text_area: {},
    is_active: true,
  });
}

export const AdminPanel = {
  name: 'Fonto Admin',
  modules: [
    'font upload',
    'text box upload',
    'asset management',
  ],
};
