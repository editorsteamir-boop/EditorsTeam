import { AdminPanel } from './AdminPanelUI.js';
import { AdminController } from './AdminController.js';
import { TextBoxListManager } from './TextBoxListManager.js';

export function mountFontoAdmin(root) {
  if (!root) return;

  root.innerHTML = `
    <section class="fonto-admin-route">
      <header>
        <h1>Fonto Admin</h1>
        <p>مدیریت فونت‌ها و تکس‌باکس‌های PNG</p>
      </header>
      <div id="fontoAdminApp"></div>
    </section>
  `;

  const app = root.querySelector('#fontoAdminApp');
  const panel = new AdminPanel(app, new AdminController());
  const list = new TextBoxListManager(app);

  panel.mount();
  list.mount();
}
