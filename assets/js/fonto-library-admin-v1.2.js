(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  if (!$('fontoLibraryTab')) return;
  const URL = "https://yxzekduddsewulkbdcoz.supabase.co";
  const KEY = "sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB";
  const SESSION_KEY = "editorsTeam.supabase.salesAdmin.v1";
  let session = null, styles = [], fonts = [];

  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]);
  const publicAsset = (path) => `${URL}/storage/v1/object/public/fonto-text-boxes/${String(path || "").split('/').map(encodeURIComponent).join('/')}`;
  function connection(kind, text) { const el = $('fontoLibraryConnectionStatus'); el.className = `db-connection-status ${kind}`; el.textContent = text; }
  function status(text) { $('fontoLibraryStatus').textContent = text; }
  function workspace(active) { $('fontoLibraryAuthBox').hidden = active; $('fontoLibraryWorkspace').hidden = !active; }
  async function rpc(name, body = {}) {
    if (!session?.access_token) throw new Error('نشست مدیریت معتبر نیست.');
    const response = await fetch(`${URL}/rest/v1/rpc/${name}`, { method:'POST', cache:'no-store', headers:{apikey:KEY, Authorization:`Bearer ${session.access_token}`, 'Content-Type':'application/json'}, body:JSON.stringify(body) });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || 'خطا در ارتباط با Supabase');
    return data;
  }
  function renderStyles() {
    $('fontoAdminStyleCount').textContent = `${styles.length.toLocaleString('fa-IR')} استایل`;
    $('fontoAdminStylesList').innerHTML = styles.length ? styles.map((item) => `<article class="fonto-admin-style-card"><img src="${esc(publicAsset(item.preview_url || item.asset_url))}" loading="lazy" alt=""><div><b>${esc(item.title)}</b><small>${esc(item.category || 'بدون دسته')}</small></div><button type="button" class="danger" data-delete-style="${esc(item.id)}">حذف</button></article>`).join('') : '<p class="requests-status">استایلی وجود ندارد.</p>';
  }
  function renderFonts() {
    const query = $('fontoAdminFontSearch').value.trim().toLowerCase();
    $('fontoAdminFontCount').textContent = `${fonts.length.toLocaleString('fa-IR')} فونت`;
    $('fontoAdminFontsList').innerHTML = fonts.map((font, index) => ({font,index})).filter(({font}) => !query || String(font.name).toLowerCase().includes(query)).map(({font,index}) => `<article class="fonto-admin-font-row"><span>${(index + 1).toLocaleString('fa-IR')}</span><b>${esc(font.name)}</b><small>${esc(font.category || '')}</small><div><button type="button" class="secondary" data-move-font="${esc(font.id)}" data-direction="-1" aria-label="بالا">↑</button><button type="button" class="secondary" data-move-font="${esc(font.id)}" data-direction="1" aria-label="پایین">↓</button><button type="button" class="danger" data-delete-font="${esc(font.id)}">حذف</button></div></article>`).join('') || '<p class="requests-status">فونتی پیدا نشد.</p>';
  }
  async function reload() {
    status('در حال دریافت کتابخانه…');
    try {
      [styles, fonts] = await Promise.all([rpc('fonto_admin_list_quick_styles'), rpc('fonto_admin_list_fonts')]);
      renderStyles(); renderFonts(); status('اطلاعات به‌روز است.'); connection('ok', '✓ اتصال مدیریت برقرار است.');
    } catch (error) { status(error.message); connection('bad', `✕ ${error.message}`); }
  }
  function validatePng(file) {
    return new Promise((resolve, reject) => {
      if (!file || file.type !== 'image/png') return reject(new Error('فقط فایل PNG پذیرفته می‌شود.'));
      if (file.size > 5 * 1024 * 1024) return reject(new Error('حجم فایل باید کمتر از ۵ مگابایت باشد.'));
      const image = new Image(), objectUrl = globalThis.URL.createObjectURL(file);
      image.onload = () => { globalThis.URL.revokeObjectURL(objectUrl); image.naturalWidth === image.naturalHeight ? resolve() : reject(new Error('تصویر باید نسبت دقیق ۱ به ۱ داشته باشد.')); };
      image.onerror = () => { globalThis.URL.revokeObjectURL(objectUrl); reject(new Error('فایل PNG معتبر نیست.')); };
      image.src = objectUrl;
    });
  }
  async function uploadStyle(event) {
    event.preventDefault(); const button = $('fontoStyleUploadBtn'); button.disabled = true;
    try {
      const file = $('fontoStyleFile').files[0]; await validatePng(file);
      const path = `admin-quick-styles/${crypto.randomUUID()}.png`;
      const response = await fetch(`${URL}/storage/v1/object/fonto-text-boxes/${path}`, {method:'POST', headers:{apikey:KEY, Authorization:`Bearer ${session.access_token}`, 'Content-Type':'image/png', 'x-upsert':'false'}, body:file});
      if (!response.ok) { const data = await response.json().catch(() => null); throw new Error(data?.message || 'آپلود تصویر ناموفق بود.'); }
      await rpc('fonto_admin_create_quick_style', {input_title:$('fontoStyleTitle').value.trim(), input_category:$('fontoStyleCategory').value, input_asset_url:path, input_text_color:$('fontoStyleTextColor').value});
      event.currentTarget.reset(); $('fontoStyleTextColor').value = '#ffffff'; status('استایل جدید اضافه شد.'); await reload();
    } catch (error) { status(error.message); } finally { button.disabled = false; }
  }
  async function removeStyleAsset(path) {
    const clean = String(path || '').replace(/^\/+/, '');
    if (!clean.startsWith('admin-quick-styles/')) return;
    const response = await fetch(`${URL}/storage/v1/object/fonto-text-boxes/${clean.split('/').map(encodeURIComponent).join('/')}`, {method:'DELETE', headers:{apikey:KEY, Authorization:`Bearer ${session.access_token}`}});
    if (!response.ok && response.status !== 404) { const data = await response.json().catch(() => null); throw new Error(data?.message || 'رکورد حذف شد، اما حذف فایل از Storage انجام نشد.'); }
  }
  async function removeFontAsset(path) {
    const clean = String(path || '').replace(/^\/+/, '');
    if (!clean || clean.includes('..')) return;
    const response = await fetch(`${URL}/storage/v1/object/fonto-fonts/${clean.split('/').map(encodeURIComponent).join('/')}`, {method:'DELETE', headers:{apikey:KEY, Authorization:`Bearer ${session.access_token}`}});
    if (!response.ok && response.status !== 404) { const data = await response.json().catch(() => null); throw new Error(data?.message || 'رکورد فونت حذف شد، اما حذف فایل از Storage انجام نشد.'); }
  }
  async function login(event) {
    event.preventDefault(); const password = $('fontoLibraryPassword');
    connection('checking', 'در حال ورود…');
    try {
      const response = await fetch(`${URL}/auth/v1/token?grant_type=password`, {method:'POST', cache:'no-store', headers:{apikey:KEY,'Content-Type':'application/json'}, body:JSON.stringify({email:$('fontoLibraryEmail').value.trim(),password:password.value})});
      const data = await response.json(); password.value = '';
      if (!response.ok || !data.access_token) throw new Error(data.message || 'ورود ناموفق بود.');
      session = data; sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); workspace(true); await reload();
    } catch (error) { password.value = ''; connection('bad', `✕ ${error.message}`); }
  }
  $('fontoLibraryLoginForm').addEventListener('submit', login);
  $('fontoStyleUploadForm').addEventListener('submit', uploadStyle);
  $('fontoLibraryReloadBtn').addEventListener('click', reload);
  $('fontoAdminFontSearch').addEventListener('input', renderFonts);
  $('fontoAdminStylesList').addEventListener('click', async (event) => { const button = event.target.closest('[data-delete-style]'); if (!button || !confirm('این استایل حذف شود؟')) return; const item=styles.find(style=>String(style.id)===button.dataset.deleteStyle); button.disabled = true; try { const removed=await rpc('fonto_admin_delete_quick_style', {input_style_id:button.dataset.deleteStyle}); if(!removed)throw new Error('استایل پیدا نشد یا قبلاً حذف شده است.'); styles=styles.filter(style=>String(style.id)!==button.dataset.deleteStyle);renderStyles();status('استایل حذف شد.'); try{await removeStyleAsset(item?.asset_url);}catch(storageError){status(storageError.message);} } catch (error) { status(error.message); button.disabled = false; } });
  $('fontoAdminFontsList').addEventListener('click', async (event) => {
    const deleteButton=event.target.closest('[data-delete-font]');
    if(deleteButton){
      const font=fonts.find(item=>String(item.id)===deleteButton.dataset.deleteFont);
      if(!font||!confirm(`فونت «${font.name}» برای همیشه حذف شود؟`))return;
      deleteButton.disabled=true;
      try{
        const fileName=await rpc('fonto_admin_delete_font',{input_font_id:font.id});
        if(!fileName)throw new Error('فونت پیدا نشد یا قبلاً حذف شده است.');
        fonts=fonts.filter(item=>String(item.id)!==String(font.id));renderFonts();status(`فونت «${font.name}» حذف شد.`);
        try{await removeFontAsset(fileName);}catch(storageError){status(storageError.message);}
      }catch(error){status(error.message);deleteButton.disabled=false;}
      return;
    }
    const button=event.target.closest('[data-move-font]'); if (!button) return; const index = fonts.findIndex((font) => String(font.id) === button.dataset.moveFont), next = index + Number(button.dataset.direction); if (index < 0 || next < 0 || next >= fonts.length) return; [fonts[index], fonts[next]] = [fonts[next], fonts[index]]; renderFonts();
  });
  $('fontoSaveFontOrder').addEventListener('click', async () => { const button = $('fontoSaveFontOrder'); button.disabled = true; try { await rpc('fonto_admin_reorder_fonts', {input_font_ids:fonts.map((font) => font.id)}); status('ترتیب فونت‌ها ذخیره شد.'); } catch (error) { status(error.message); } finally { button.disabled = false; } });
  $('fontoLibraryLogoutBtn').addEventListener('click', () => { session = null; sessionStorage.removeItem(SESSION_KEY); workspace(false); connection('neutral','برای مدیریت کتابخانه وارد شوید.'); });
  try { session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch {}
  session?.access_token ? (workspace(true), reload()) : workspace(false);
})();
