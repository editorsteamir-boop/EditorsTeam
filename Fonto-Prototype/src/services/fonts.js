import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../config/supabase.js';

const headers = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
};

export async function getFonts() {
  const params = new URLSearchParams({
    select: '*',
    is_active: 'eq.true',
    order: 'created_at.desc',
  });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/fonto_fonts?${params}`, { headers });
  if (!response.ok) throw new Error(`Failed to load fonts: ${response.status}`);
  return response.json();
}

export function getFontPublicUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.replace(/^\/+/, '').replace(/^fonto-fonts\//, '');
  return `${SUPABASE_URL}/storage/v1/object/public/fonto-fonts/${cleanPath}`;
}

export async function loadFont(font) {
  const family = font.family || font.name;
  const url = getFontPublicUrl(font.file_url);
  const face = new FontFace(family, `url(${JSON.stringify(url)})`);
  const loaded = await face.load();
  document.fonts.add(loaded);
  return family;
}
