import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../config/supabase.js';

const headers = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
};

export async function uploadAsset(bucket, path, file) {
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export async function createTextBox(data) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/fonto_text_boxes`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Create text box failed: ${response.status}`);
  }

  return response.json();
}

export async function createFont(data) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/fonto_fonts`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Create font failed: ${response.status}`);
  }

  return response.json();
}
