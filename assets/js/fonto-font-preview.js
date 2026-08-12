/* EditorsTeam Fonto font preview library */
(() => {
'use strict';
const SUPABASE_URL='https://yxzekduddsewulkbdcoz.supabase.co';
const SUPABASE_KEY='sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB';
const PREVIEW_TEXT='ادیتورز تیم';
const ALLOWED=new Set(['persian','english','arabic']);
const loaded=new Map();let observer;
const fontUrl=n=>`${SUPABASE_URL}/storage/v1/object/public/fonto-fonts/${String(n).split('/').map(encodeURIComponent).join('/')}`;
const familyFor=id=>`fonto_${String(id).replace(/[^a-zA-Z0-9_-]/g,'_')}`;
async function loadFont(item,card){
 const family=familyFor(item.id);
 if(!loaded.has(item.id)) loaded.set(item.id,(async()=>{const face=new FontFace(family,`url(${JSON.stringify(fontUrl(item.file_name))})`);const ready=await face.load();document.fonts.add(ready);await document.fonts.load(`32px "${family}"`,PREVIEW_TEXT);return family;})());
 try{await loaded.get(item.id);applyPreview(card,family);return family;}catch(e){loaded.delete(item.id);card?.classList.add('fonto-font-card-error');throw e;}
}
function applyPreview(card,family){const el=card?.querySelector('.fonto-font-preview-text');if(!el)return;el.style.setProperty('font-family',`"${family}"`,'important');el.style.setProperty('font-weight','400','important');el.style.setProperty('font-style','normal','important');card.classList.add('fonto-font-card-ready');requestAnimationFrame(()=>fitText(el));}
function fitText(el){const box=el.parentElement;if(!box)return;let s=34;el.style.fontSize=s+'px';const w=Math.max(40,box.clientWidth-18),h=Math.max(28,box.clientHeight-10);while(s>13&&(el.scrollWidth>w||el.scrollHeight>h)){el.style.fontSize=(--s)+'px';}}
function makeCard(item){const card=document.createElement('button');card.type='button';card.className='fonto-font-card';card.dataset.fontId=item.id;const box=document.createElement('span');box.className='fonto-font-preview-box';const text=document.createElement('span');text.className='fonto-font-preview-text';text.dir='rtl';text.lang='fa';text.textContent=PREVIEW_TEXT;const name=document.createElement('span');name.className='fonto-font-name';name.textContent=item.name||item.file_name;box.appendChild(text);card.append(box,name);card._fontItem=item;card.addEventListener('click',async()=>{try{const family=await loadFont(item,card);document.querySelectorAll('.fonto-font-card.selected').forEach(x=>x.classList.remove('selected'));card.classList.add('selected');window.dispatchEvent(new CustomEvent('fonto:font-selected',{detail:{family,name:item.name,fileName:item.file_name}}));}catch(_){}});observer.observe(card);return card;}
async function init(){const host=document.getElementById('fontoFontPreviewList');if(!host||host.dataset.ready==='1')return;host.dataset.ready='1';host.innerHTML='<div class="fonto-font-loading">در حال دریافت فونت‌ها...</div>';observer=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;observer.unobserve(e.target);loadFont(e.target._fontItem,e.target).catch(()=>{});}),{root:host,rootMargin:'180px 240px',threshold:.01});try{const r=await fetch(`${SUPABASE_URL}/rest/v1/fonto_fonts?select=id,name,file_name,category&order=category.asc,name.asc`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}});if(!r.ok)throw Error(r.status);const items=(await r.json()).filter(x=>ALLOWED.has(x.category));host.innerHTML='';items.forEach(x=>host.appendChild(makeCard(x)));}catch(_){host.innerHTML='<div class="fonto-font-loading">بارگذاری فونت‌ها انجام نشد.</div>';}}
window.addEventListener('resize',()=>document.querySelectorAll('.fonto-font-card-ready .fonto-font-preview-text').forEach(fitText));document.addEventListener('DOMContentLoaded',init);window.initFontoFontPreviews=init;
})();