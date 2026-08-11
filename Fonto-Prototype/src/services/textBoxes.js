import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../config/supabase.js';

const headers = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
};

export async function getTextBoxes() {
  const params = new URLSearchParams({
    select: '*',
    is_active: 'eq.true',
    order: 'sort_order.asc,created_at.desc',
  });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/fonto_text_boxes?${params}`, { headers });
  if (!response.ok) throw new Error(`Failed to load text boxes: ${response.status}`);
  return response.json();
}

export function getTextBoxPublicUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.replace(/^\/+/, '').replace(/^fonto-text-boxes\//, '');
  return `${SUPABASE_URL}/storage/v1/object/public/fonto-text-boxes/${cleanPath}`;
}
