import { createAdminSession } from './AdminGuard.js';

export function AdminLogin({ container, onSuccess }) {
  if (!container) return;

  container.innerHTML = `
    <div class="fonto-admin-login">
      <h2>Fonto Admin</h2>
      <input id="adminPassword" type="password" placeholder="Admin password" />
      <button id="adminLoginButton">ورود</button>
      <p id="adminLoginMessage"></p>
    </div>
  `;

  container.querySelector('#adminLoginButton')?.addEventListener('click', () => {
    const password = container.querySelector('#adminPassword')?.value;

    if (!password) {
      container.querySelector('#adminLoginMessage').textContent = 'رمز را وارد کنید';
      return;
    }

    createAdminSession();
    container.querySelector('#adminLoginMessage').textContent = 'ورود موفق';

    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  });
}
