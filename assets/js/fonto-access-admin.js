(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  if (!$("fontoAccessTab")) return;

  const SUPABASE_URL = "https://yxzekduddsewulkbdcoz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB";
  const SESSION_KEY = "editorsTeam.supabase.salesAdmin.v1";
  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>'"]/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[char],
    );
  let session = null;
  let users = [];

  function setConnection(kind, message) {
    const element = $("fontoAdminConnectionStatus");
    element.className = `db-connection-status ${kind}`;
    element.textContent = message;
  }

  function showWorkspace(active) {
    $("fontoAdminAuthBox").hidden = active;
    $("fontoAdminWorkspace").hidden = !active;
  }

  async function rpc(name, body = {}) {
    if (!session?.access_token) throw new Error("نشست مدیریت معتبر نیست.");
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok)
      throw new Error(data?.message || "خطا در ارتباط با Supabase");
    return data;
  }

  function formatDate(value) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function renderUsers() {
    $("fontoRequestCount").textContent =
      `${users.length.toLocaleString("fa-IR")} درخواست`;
    $("fontoRequestsList").innerHTML = users.length
      ? users
          .map(
            (user) => `
      <article class="fonto-request-card" data-fonto-user="${esc(user.id)}">
        <div class="fonto-request-head"><div><h3>${esc(user.full_name)}</h3><p>${esc(user.phone)} · ${esc(user.city)}</p></div><span class="fonto-user-state ${esc(user.status)}">${user.status === "approved" ? "فعال" : user.status === "suspended" ? "تعلیق" : "در انتظار"}</span></div>
        <dl><div><dt>تاریخ درخواست</dt><dd>${esc(formatDate(user.requested_at))}</dd></div><div><dt>وضعیت رمز</dt><dd>${user.password_set ? `تنظیم شده · ${esc(formatDate(user.password_set_at))}` : "هنوز تعیین نشده"}</dd></div></dl>
        <div class="fonto-request-actions"><input data-user-password type="password" autocomplete="off" minlength="6" maxlength="64" placeholder="رمز جدید (حداقل ۶ کاراکتر)"><button type="button" data-set-password>تعیین / تغییر رمز</button><button type="button" class="danger" data-delete-user>حذف درخواست</button></div>
      </article>`,
          )
          .join("")
      : '<p class="requests-status">هنوز درخواستی ثبت نشده است.</p>';
  }

  function renderStats(summary, daily) {
    $("fontoPendingStat").textContent = Number(
      summary.pending_requests || 0,
    ).toLocaleString("fa-IR");
    $("fontoApprovedStat").textContent = Number(
      summary.approved_users || 0,
    ).toLocaleString("fa-IR");
    $("fontoTodayStat").textContent = Number(
      summary.today_logins || 0,
    ).toLocaleString("fa-IR");
    $("fontoTotalStat").textContent = Number(
      summary.total_logins || 0,
    ).toLocaleString("fa-IR");
    $("fontoDailyStats").innerHTML =
      `<h3>ورودهای روزانه ابزار فونت</h3><div>${daily.map((row) => `<span><b>${Number(row.login_count || 0).toLocaleString("fa-IR")}</b><small>${new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(new Date(`${row.login_date}T12:00:00`))}</small></span>`).join("")}</div>`;
  }

  async function reload() {
    $("fontoAdminStatus").textContent = "در حال دریافت درخواست‌ها و آمار…";
    try {
      const [list, summary, daily] = await Promise.all([
        rpc("fonto_admin_list_users"),
        rpc("fonto_admin_summary"),
        rpc("get_fonto_daily_login_stats", { input_days: 7 }),
      ]);
      users = Array.isArray(list) ? list : [];
      renderUsers();
      renderStats(summary || {}, Array.isArray(daily) ? daily : []);
      $("fontoAdminStatus").textContent = "اطلاعات به‌روز است.";
    } catch (error) {
      $("fontoAdminStatus").textContent = error.message;
      if (/نشست|دسترسی مدیر|JWT/i.test(error.message)) logout();
    }
  }

  async function login(event) {
    event.preventDefault();
    const email = $("fontoAdminEmail").value.trim();
    const passwordInput = $("fontoAdminPassword");
    const password = passwordInput.value;
    const button = $("fontoAdminLoginBtn");
    button.disabled = true;
    button.textContent = "در حال ورود…";
    setConnection("checking", "در حال بررسی حساب مدیر…");
    try {
      const response = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          cache: "no-store",
          headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.access_token)
        throw new Error(data.message || "ایمیل یا رمز مدیر صحیح نیست.");
      session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        email,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      passwordInput.value = "";
      showWorkspace(true);
      await reload();
    } catch (error) {
      setConnection("bad", `✕ ${error.message}`);
    } finally {
      passwordInput.value = "";
      button.disabled = false;
      button.textContent = "ورود به مدیریت کاربران";
    }
  }

  function logout() {
    session = null;
    sessionStorage.removeItem(SESSION_KEY);
    showWorkspace(false);
  }

  $("fontoRequestsList").addEventListener("click", async (event) => {
    const card = event.target.closest("[data-fonto-user]");
    if (!card) return;
    const userId = card.dataset.fontoUser;
    if (event.target.closest("[data-set-password]")) {
      const input = card.querySelector("[data-user-password]");
      const password = input.value;
      if (password.length < 6) return alert("رمز باید حداقل ۶ کاراکتر باشد.");
      try {
        await rpc("fonto_admin_set_password", {
          input_user_id: userId,
          input_password: password,
        });
        input.value = "";
        alert("رمز با موفقیت تعیین و کاربر فعال شد.");
        await reload();
      } catch (error) {
        input.value = "";
        alert(error.message);
      }
    }
    if (event.target.closest("[data-delete-user]")) {
      const user = users.find((item) => item.id === userId);
      if (!confirm(`درخواست ${user?.full_name || "این کاربر"} حذف شود؟`))
        return;
      try {
        await rpc("fonto_admin_delete_user", { input_user_id: userId });
        await reload();
      } catch (error) {
        alert(error.message);
      }
    }
  });

  $("fontoAdminLoginForm").addEventListener("submit", login);
  $("fontoAdminReloadBtn").addEventListener("click", reload);
  $("fontoAdminLogoutBtn").addEventListener("click", logout);
  try {
    session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {}
  if (session?.access_token) {
    showWorkspace(true);
    reload();
  } else showWorkspace(false);
})();
