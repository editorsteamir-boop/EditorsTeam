import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../config/supabase.js';

function headers(accessToken = SUPABASE_PUBLISHABLE_KEY) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

export async function getProjects(userId, accessToken) {
  const params = new URLSearchParams({
    select: '*',
    user_id: `eq.${userId}`,
    order: 'updated_at.desc',
  });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/fonto_projects?${params}`, {
    headers: headers(accessToken),
  });
  if (!response.ok) throw new Error(`Failed to load projects: ${response.status}`);
  return response.json();
}

export async function saveProject(project, accessToken) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/fonto_projects`, {
    method: 'POST',
    headers: {
      ...headers(accessToken),
      Prefer: 'return=representation',
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) throw new Error(`Failed to save project: ${response.status}`);
  return response.json();
}

export async function updateProject(id, changes, accessToken) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/fonto_projects?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      ...headers(accessToken),
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ ...changes, updated_at: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error(`Failed to update project: ${response.status}`);
  return response.json();
}
