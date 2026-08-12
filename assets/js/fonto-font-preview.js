/* EditorsTeam Fonto font preview library - isolated from canvas editor */
(() => {
  'use strict';
  const SUPABASE_URL='https://yxzekduddsewulkbdcoz.supabase.co';
  const SUPABASE_KEY='sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB';
  const PREVIEW_TEXT='ادیتورز تیم';
  const loaded=new Map();
  let observer;

  const fontUrl=fileName => `${SUPABASE_URL}/storage/v1/object/public/fonto-fonts/${fileName.split('/').map(encodeURIComponent).join('/')}`;
  const familyFor=id => `fonto_preview_${String(id).replace(/[^a-zA-Z0-9_-]/g,'_')}`;

  async function loadFont(item, card){
    const family=familyFor(item.id);
    if(loaded.has(item.id)){await loaded.get(item.id);applyPreview(card,family);return family;}
    const task=(async()=>{const face=new FontFace(family,`url("${fontUrl(item.file_name)}")`,{display:'swap'});const ready=await face.load();document.fonts.add(ready);return family;})();
    loaded.set(item.id,task);
    try{await task;applyPreview(card,family);return family;}
    catch(err){loaded.delete(item.id);card?.classList.add('fonto-font-card-error');throw err;}
  }

  function applyPreview(card,family){
    if(!card)return;const text=card.querySelector('.fonto-font-preview-text');if(!text)return;
    text.style.fontFamily=`"${family}"`;card.classList.add('fonto-font-card-ready');requestAnimationFrame(()=>fitText(text));
  }

  function fitText(el){
    const box=el.parentElement;if(!box)return;let size=34;el.style.fontSize=`${size}px`;
    const maxW=Math.max(40,box.clientWidth-18),maxH=Math.max(28,box.clientHeight-10);
    while(size>15 && (el.scrollWidth>maxW || el.scrollHeight>maxH)){size-=1;el.style.fontSize=`${size}px`;}
  }

  function selectInEditor(family,item){
    const select=document.getElementById('fontoFont');if(!select)return;
    let option=[...select.options].find(o=>o.value===family);
    if(!option){option=document.createElement('option');option.value=family;option.textContent=item.name||item.file_name;select.appendChild(option);}
    select.value=family;
    select.dispatchEvent(new Event('input',{bubbles:true}));
    select.dispatchEvent(new Event('change',{bubbles:true}));
  }

  function makeCard(item){
    const card=document.createElement('button');card.type='button';card.className='fonto-font-card';card.dataset.fontId=item.id;
    card.innerHTML=`<span class="fonto-font-preview-box"><span class="fonto-font-preview-text" dir="rtl">${PREVIEW_TEXT}</span></span><span class="fonto-font-name"></span>`;
    card.querySelector('.fonto-font-name').textContent=item.name||item.file_name;
    card.addEventListener('click',async()=>{
      try{const family=await loadFont(item,card);document.querySelectorAll('.fonto-font-card.selected').forEach(x=>x.classList.remove('selected'));card.classList.add('selected');selectInEditor(family,item);window.dispatchEvent(new CustomEvent('fonto:font-selected',{detail:{family,name:item.name,fileName:item.file_name}}));}catch(_){}
    });
    observer.observe(card);return card;
  }

  async function init(){
    const host=document.getElementById('fontoFontPreviewList');if(!host||host.dataset.ready==='1')return;host.dataset.ready='1';
    host.innerHTML='<div class="fonto-font-loading">در حال دریافت فونت‌ها...</div>';
    observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;const card=entry.target,item=card._fontItem;observer.unobserve(card);if(item)loadFont(item,card).catch(()=>{});});},{root:host,rootMargin:'180px 240px',threshold:.01});
    try{
      const r=await fetch(`${SUPABASE_URL}/rest/v1/fonto_fonts?select=id,name,file_name,category&order=category.asc,name.asc`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}});if(!r.ok)throw new Error(`fonts ${r.status}`);
      const items=await r.json();host.innerHTML='';items.forEach(item=>{const card=makeCard(item);card._fontItem=item;host.appendChild(card);});
    }catch(_){host.innerHTML='<div class="fonto-font-loading">بارگذاری فونت‌ها انجام نشد.</div>';}
  }

  window.addEventListener('resize',()=>document.querySelectorAll('.fonto-font-card-ready .fonto-font-preview-text').forEach(fitText));
  document.addEventListener('DOMContentLoaded',init);window.initFontoFontPreviews=init;
})();