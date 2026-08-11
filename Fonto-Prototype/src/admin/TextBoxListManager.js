import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../config/supabase.js';

const headers = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  'Content-Type': 'application/json',
};

export async function getAdminTextBoxes() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/fonto_text_boxes?select=*&order=created_at.desc`,
    { headers }
  );

  if (!response.ok) throw new Error('Cannot load text boxes');
  return response.json();
}

export async function toggleTextBox(id, active) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/fonto_text_boxes?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: {
        ...headers,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ is_active: active }),
    }
  );

  if (!response.ok) throw new Error('Cannot update text box');
  return response.json();
}

export async function deleteTextBox(id) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/fonto_text_boxes?id=eq.${id}`,
    {
      method: 'DELETE',
      headers,
    }
  );

  if (!response.ok) throw new Error('Cannot delete text box');
}

export function renderTextBoxList(items, container) {
  if (!container) return;

  container.innerHTML = items.map(item => `
    <div class="admin-text-box-item">
      <strong>${item.title || 'بدون نام'}</strong>
      <span>${item.category || ''}</span>
      <button data-id="${item.id}" data-action="toggle">
        ${item.is_active ? 'غیرفعال' : 'فعال'}
      </button>
      <button data-id="${item.id}" data-action="delete">
        حذف
      </button>
    </div>
  `).join('');
}
