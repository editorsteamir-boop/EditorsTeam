(() => {
"use strict";
const DATA_URL="./data/projects.json?v=15.0.0", STORAGE_KEY="editorsTeam.projects.v1";
const esc=v=>String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
let projects=[];
const clean=v=>(Array.isArray(v)?v:[]).filter(p=>p&&p.active!==false).sort((a,b)=>(a.order||0)-(b.order||0));
function backup(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return[]}}
function renderHome(){const g=document.getElementById("projectGrid");if(!g)return;g.innerHTML=projects.map(p=>`<button class="project-card" type="button" data-project-id="${esc(p.id)}"><span>${esc(p.icon||"🎨")}</span><b>${esc(p.title||"بدون عنوان")}</b></button>`).join("")||'<div class="home-note">هنوز پروژه‌ای ثبت نشده است.</div>'}
function bootstrap(){
  const embedded=clean(window.__ET_PROJECTS__);
  const cached=clean(backup());
  projects=cached.length?cached:embedded;
  renderHome();
  // Refresh in background. Never hold the UI for this request.
  fetch(DATA_URL,{cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject()).then(v=>{
    if(!Array.isArray(v))return;
    localStorage.setItem(STORAGE_KEY,JSON.stringify(v));
    projects=clean(v);renderHome();
  }).catch(()=>{});
  window.SalesStore?.load().then(()=>refreshSaleControls(document)).catch(()=>{});
}
function saleBox(project,item,index){
  if(!window.SalesStore)return "";
  const id=window.SalesStore.saleId("project",project.id,item.src), sale=window.SalesStore.get(id);
  const has=!!(sale?.price_toman>0), price=has?window.SalesStore.formatPrice(sale.price_toman):"قیمت ثبت نشده";
  return `<div class="sale-row" data-sale-row="${esc(id)}"><div class="sale-price ${has?'':'no-price'}" data-sale-price>${esc(price)}${has?' <span>تومان</span>':''}</div><button type="button" class="sale-cart" data-sale-id="${esc(id)}" ${(!has||sale?.active===false)?'disabled':''} aria-label="خرید پروژه ${index+1}"><svg class="cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 7H7"/><circle cx="10" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/></svg></button></div>`;
}
function refreshSaleControls(root=document){
  if(!window.SalesStore)return;
  root.querySelectorAll("[data-sale-row]").forEach(row=>{
    const sale=window.SalesStore.get(row.dataset.saleRow),has=!!(sale?.price_toman>0),p=row.querySelector("[data-sale-price]"),c=row.querySelector("[data-sale-id]");
    if(p){p.classList.toggle("no-price",!has);p.innerHTML=has?`${window.SalesStore.formatPrice(sale.price_toman)} <span>تومان</span>`:"قیمت ثبت نشده"}
    if(c)c.disabled=!has||sale?.active===false;
  });
}
function openProject(id){
  const p=projects.find(x=>String(x.id)===String(id));if(!p)return;
  document.getElementById("projectsHome")?.classList.remove("active");document.getElementById("projectDynamic")?.classList.add("active");
  document.getElementById("projectDynamicTitle").textContent=`${p.description||`نمونه پروژه‌های ${p.title}`} (جهت بزرگنمایی کلیک کنید)`;
  document.getElementById("projectDynamicIcon").textContent=p.icon||"🎨";
  const g=document.getElementById("projectDynamicGallery");
  g.innerHTML=(p.images||[]).map((im,i)=>`<article class="sellable-card"><img class="gallery-img" src="${esc(im.src)}" alt="${esc(im.alt||`${p.title} ${i+1}`)}" data-gallery-image loading="${i===0?'eager':'lazy'}" decoding="async" ${i===0?'fetchpriority="high"':''}>${saleBox(p,im,i)}</article>`).join("")||'<div class="home-note">هنوز تصویری برای این پروژه ثبت نشده است.</div>';
  refreshSaleControls(g);
  window.SalesStore?.load().then(()=>refreshSaleControls(g)).catch(()=>{});
}
function backProjects(){document.querySelectorAll("#projects .project-page").forEach(p=>p.classList.remove("active"));document.getElementById("projectsHome")?.classList.add("active")}
document.addEventListener("click",e=>{
  const cart=e.target.closest("[data-sale-id]");if(cart){e.preventDefault();e.stopPropagation();window.SalesStore?.buy(cart.dataset.saleId);return}
  const card=e.target.closest("[data-project-id]");if(card)openProject(card.dataset.projectId);
  const img=e.target.closest("[data-gallery-image]");if(img&&window.openImage)window.openImage(img.src);
});
window.openProject=openProject;window.backProjects=backProjects;
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",bootstrap):bootstrap();
})();