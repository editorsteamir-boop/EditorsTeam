(() => {
  "use strict";
  const DATA_URL = "./data/projects.json?v=11.0.0";
  const STORAGE_KEY = "editorsTeam.projects.v1";
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  let projects = [];
  function readBackup(){ try { const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); return Array.isArray(v)?v:[]; } catch (_) { return []; } }
  async function loadProjects(){
    let loaded=[];
    try { const r=await fetch(DATA_URL,{cache:"no-cache"}); if(!r.ok)throw 0; const v=await r.json(); if(!Array.isArray(v))throw 0; loaded=v;localStorage.setItem(STORAGE_KEY,JSON.stringify(v)); }
    catch (_) { loaded=readBackup(); }
    projects=loaded.filter(p=>p&&p.active!==false).sort((a,b)=>(a.order||0)-(b.order||0));
    if(window.SalesStore) await window.SalesStore.load();
    renderHome();
  }
  function renderHome(){ const grid=document.getElementById("projectGrid");if(!grid)return;grid.innerHTML=projects.map(p=>`<button class="project-card" type="button" data-project-id="${esc(p.id)}"><span>${esc(p.icon||"🎨")}</span><b>${esc(p.title||"بدون عنوان")}</b></button>`).join("")||'<div class="home-note">هنوز پروژه‌ای ثبت نشده است.</div>'; }
  function saleBox(project,item,index){
    if(!window.SalesStore)return "";
    const saleId=window.SalesStore.saleId("project",project.id,item.src);
    const sale=window.SalesStore.get(saleId);
    const price=sale?.price_toman>0?window.SalesStore.formatPrice(sale.price_toman):"قیمت ثبت نشده";
    const disabled=!sale||sale.active===false||!(sale.price_toman>0);
    return `<div class="sale-row"><div class="sale-price">${esc(price)}${sale?.price_toman>0?' <span>تومان</span>':''}</div><button type="button" class="sale-cart" data-sale-id="${esc(saleId)}" ${disabled?'disabled':''} aria-label="خرید پروژه ${index+1}">🛒</button></div>`;
  }
  function openProject(id){
    const p=projects.find(x=>String(x.id)===String(id));if(!p)return;
    document.getElementById("projectsHome")?.classList.remove("active");document.getElementById("projectDynamic")?.classList.add("active");
    document.getElementById("projectDynamicTitle").textContent=`${p.description||`نمونه پروژه‌های ${p.title}`} (جهت بزرگنمایی کلیک کنید)`;document.getElementById("projectDynamicIcon").textContent=p.icon||"🎨";
    const gallery=document.getElementById("projectDynamicGallery");
    gallery.innerHTML=(p.images||[]).map((im,i)=>`<article class="sellable-card"><img class="gallery-img" src="${esc(im.src)}" alt="${esc(im.alt||`${p.title} ${i+1}`)}" data-gallery-image>${saleBox(p,im,i)}</article>`).join("")||'<div class="home-note">هنوز تصویری برای این پروژه ثبت نشده است.</div>';
  }
  function backProjects(){document.querySelectorAll("#projects .project-page").forEach(p=>p.classList.remove("active"));document.getElementById("projectsHome")?.classList.add("active");}
  document.addEventListener("click",e=>{
    const cart=e.target.closest("[data-sale-id]");if(cart){e.preventDefault();e.stopPropagation();window.SalesStore?.buy(cart.dataset.saleId);return;}
    const card=e.target.closest("[data-project-id]");if(card)openProject(card.dataset.projectId);
    const image=e.target.closest("[data-gallery-image]");if(image&&window.openImage)window.openImage(image.src);
  });
  window.openProject=openProject;window.backProjects=backProjects;
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",loadProjects):loadProjects();
})();
