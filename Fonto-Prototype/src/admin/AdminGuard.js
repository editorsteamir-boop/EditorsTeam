const ADMIN_SESSION_KEY = 'fonto_admin_session';

export function createAdminSession(user) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
    user,
    createdAt: Date.now()
  }));
}

export function hasAdminSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY));
    return Boolean(session && Date.now() - session.createdAt < 8 * 60 * 60 * 1000);
  } catch {
    return false;
  }
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function requireAdmin() {
  if (!hasAdminSession()) {
    throw new Error('Admin authentication required');
  }
  return true;
}
