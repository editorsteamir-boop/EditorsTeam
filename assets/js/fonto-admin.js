(() => {
  'use strict';
  const SUPABASE_URL='https://yxzekduddsewulkbdcoz.supabase.co';
  const SUPABASE_KEY='sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB';
  const SESSION_KEY='editorsTeam.fonto.admin.v1';
  const $=id=>document.getElementById(id);
  let session=null;

  function authHeaders(json=true){
    const h={apikey:SUPABASE_KEY,Authorization:`Bearer ${session?.access_token||SUPABASE_KEY}`};
    if(json)h['Content-Type']='application/json';
    return h;
  }
  function setLogin(on){$('fontoAdminLogin').classList.toggle('fonto-hidden',on);$('fontoAdminWorkspace').classList.toggle('fonto-hidden',!on);}
  function safeName(name){return String(name||'file.png').normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'')||'file.png';}
  function publicUrl(path){return `${SUPABASE_URL}/storage/v1/object/public/fonto-text-boxes/${String(path||'').split('/').map(encodeURIComponent).join('/')}`;}

  async function login(){
    const email=$('fontoAdminEmail').value.trim(),password=$('fontoAdminPassword').value;
    if(!email||!password){$('fontoAdminLoginStatus').textContent='ایمیل و رمز را وارد کنید.';return;}
    $('fontoAdminLoginStatus').textContent='در حال ورود...';
    const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||!d.access_token){$('fontoAdminLoginStatus').textContent=d.message||'ورود ناموفق بود.';return;}
    session={access_token:d.access_token,refresh_token:d.refresh_token,email};
    sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));
    $('fontoAdminIdentity').textContent=email;
    setLogin(true);
    await loadBoxes();
  }

  async function loadBoxes(){
    const list=$('fontoBoxList');list.innerHTML='<p>در حال دریافت...</p>';
    const r=await fetch(`${SUPABASE_URL}/rest/v1/fonto_text_boxes?select=*&order=sort_order.asc,created_at.desc`,{headers:authHeaders(false)});
    const rows=r.ok?await r.json():[];
    if(!r.ok){list.innerHTML='<p>دریافت لیست ناموفق بود.</p>';return;}
    list.innerHTML=rows.length?rows.map(x=>{
      const src=/^https?:\/\//i.test(x.image_url||'')?x.image_url:publicUrl(String(x.image_url||'').replace(/^fonto-text-boxes\//,''));
      return `<article class="fonto-item" data-id="${x.id}"><img src="${src}" alt=""><div><b>${x.title||'بدون عنوان'}</b><div>${x.category||'بدون دسته'}</div><small>${x.is_active===false?'غیرفعال':'فعال'}</small></div><div class="fonto-actions"><button class="fonto-secondary" data-toggle="${x.id}" data-active="${x.is_active!==false}">${x.is_active===false?'فعال کن':'غیرفعال کن'}</button><button class="fonto-danger" data-delete="${x.id}">حذف</button></div></article>`;
    }).join(''):'<p>هنوز تکس‌باکسی ثبت نشده.</p>';
  }

  async function upload(){
    const title=$('fontoBoxTitle').value.trim(),category=$('fontoBoxCategory').value.trim(),file=$('fontoBoxFile').files?.[0];
    if(!title||!file){$('fontoBoxUploadStatus').textContent='عنوان و فایل PNG لازم است.';return;}
    if(file.type!=='image/png'){ $('fontoBoxUploadStatus').textContent='فقط PNG مجاز است.';return; }
    $('fontoBoxUploadStatus').textContent='در حال آپلود...';
    const path=`${category||'uncategorized'}/${Date.now()}-${safeName(file.name)}`;
    let r=await fetch(`${SUPABASE_URL}/storage/v1/object/fonto-text-boxes/${path}`,{method:'POST',headers:{...authHeaders(false),'Content-Type':'image/png','x-upsert':'false'},body:file});
    if(!r.ok){const e=await r.text();$('fontoBoxUploadStatus').textContent=`آپلود ناموفق: ${e}`;return;}
    const row={title,category:category||null,image_url:path,preview_url:null,text_area:{x:.5,y:.5,width:.8,height:.25},is_active:true,sort_order:0};
    r=await fetch(`${SUPABASE_URL}/rest/v1/fonto_text_boxes`,{method:'POST',headers:{...authHeaders(),Prefer:'return=representation'},body:JSON.stringify(row)});
    if(!r.ok){const e=await r.text();$('fontoBoxUploadStatus').textContent=`ثبت دیتابیس ناموفق: ${e}`;return;}
    $('fontoBoxUploadStatus').textContent='✓ آپلود و ثبت شد.';
    $('fontoBoxTitle').value='';$('fontoBoxCategory').value='';$('fontoBoxFile').value='';
    await loadBoxes();
  }

  async function toggle(id,active){
    const r=await fetch(`${SUPABASE_URL}/rest/v1/fonto_text_boxes?id=eq.${encodeURIComponent(id)}`,{method:'PATCH',headers:{...authHeaders(),Prefer:'return=minimal'},body:JSON.stringify({is_active:!active})});
    if(r.ok)await loadBoxes(); else alert('تغییر وضعیت انجام نشد.');
  }
  async function remove(id){
    if(!confirm('این تکس‌باکس از دیتابیس حذف شود؟'))return;
    const r=await fetch(`${SUPABASE_URL}/rest/v1/fonto_text_boxes?id=eq.${encodeURIComponent(id)}`,{method:'DELETE',headers:{...authHeaders(),Prefer:'return=minimal'}});
    if(r.ok)await loadBoxes(); else alert('حذف انجام نشد.');
  }

  $('fontoAdminLoginBtn').onclick=login;
  $('fontoAdminLogoutBtn').onclick=()=>{session=null;sessionStorage.removeItem(SESSION_KEY);setLogin(false);};
  $('fontoBoxUploadBtn').onclick=upload;
  $('fontoBoxReloadBtn').onclick=loadBoxes;
  $('fontoBoxList').addEventListener('click',e=>{const t=e.target.closest('[data-toggle]'),d=e.target.closest('[data-delete]');if(t)toggle(t.dataset.toggle,t.dataset.active==='true');if(d)remove(d.dataset.delete);});
  try{session=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null');}catch{}
  if(session?.access_token){$('fontoAdminIdentity').textContent=session.email||'Admin';setLogin(true);loadBoxes();}else setLogin(false);
})();
