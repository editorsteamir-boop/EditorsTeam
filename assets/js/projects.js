(() => {
  "use strict";
  const DATA_URL = "./data/projects.json?v=11.0.0";
  const STORAGE_KEY = "editorsTeam.projects.v1";
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  let projects = [];
  function readBackup(){ try { const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); return Array.isArray(v)?v:[]; } catch (_) { return []; } }
  async function loadProjects(){
    const backup=readBackup();
    if(backup.length){
      projects=backup.filter(p=>p&&p.active!==false).sort((a,b)=>(a.order||0)-(b.order||0));
      renderHome();
    }
    const salesPromise=window.SalesStore?window.SalesStore.load():Promise.resolve();
    try {
      const r=await fetch(DATA_URL,{cache:"no-cache"}); if(!r.ok)throw 0;
      const v=await r.json(); if(!Array.isArray(v))throw 0;
      projects=v.filter(p=>p&&p.active!==false).sort((a,b)=>(a.order||0)-(b.order||0));
      localStorage.setItem(STORAGE_KEY,JSON.stringify(v));
      renderHome();
    } catch (_) {
      if(!projects.length){projects=backup;renderHome();}
    }
    salesPromise.then(()=>refreshSaleControls(document)).catch(()=>{});
  }
  function renderHome(){ const grid=document.getElementById("projectGrid");if(!grid)return;grid.innerHTML=projects.map(p=>`<button class="project-card" type="button" data-project-id="${esc(p.id)}"><span>${esc(p.icon||"🎨")}</span><b>${esc(p.title||"بدون عنوان")}</b></button>`).join("")||'<div class="home-note">هنوز پروژه‌ای ثبت نشده است.</div>'; }
  function saleBox(project,item,index){
    if(!window.SalesStore)return "";
    const saleId=window.SalesStore.saleId("project",project.id,item.src);
    const sale=window.SalesStore.get(saleId);
    const hasPrice=!!(sale?.price_toman>0);
    const price=hasPrice?window.SalesStore.formatPrice(sale.price_toman):"قیمت ثبت نشده";
    const disabled=!sale||sale.active===false||!hasPrice;
    return `<div class="sale-row" data-sale-row="${esc(saleId)}"><div class="sale-price ${hasPrice?'':'no-price'}" data-sale-price>${esc(price)}${hasPrice?' <span>تومان</span>':''}</div><button type="button" class="sale-cart" data-sale-id="${esc(saleId)}" ${disabled?'disabled':''} aria-label="خرید پروژه ${index+1}"><svg class="cart-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 7H7"/><circle cx="10" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/></svg></button></div>`;
  }

  function refreshSaleControls(root=document){
    if(!window.SalesStore)return;
    root.querySelectorAll('[data-sale-row]').forEach(row=>{
      const id=row.dataset.saleRow,sale=window.SalesStore.get(id),hasPrice=!!(sale?.price_toman>0);
      const price=row.querySelector('[data-sale-price]'),cart=row.querySelector('[data-sale-id]');
      if(price){price.classList.toggle('no-price',!hasPrice);price.innerHTML=hasPrice?`${window.SalesStore.formatPrice(sale.price_toman)} <span>تومان</span>`:'قیمت ثبت نشده';}
      if(cart)cart.disabled=!hasPrice||sale?.active===false;
    });
  }
  function openProject(id){
    const p=projects.find(x=>String(x.id)===String(id));if(!p)return;
    document.getElementById("projectsHome")?.classList.remove("active");document.getElementById("projectDynamic")?.classList.add("active");
    document.getElementById("projectDynamicTitle").textContent=`${p.description||`نمونه پروژه‌های ${p.title}`} (جهت بزرگنمایی کلیک کنید)`;document.getElementById("projectDynamicIcon").textContent=p.icon||"🎨";
    const gallery=document.getElementById("projectDynamicGallery");
    gallery.innerHTML=(p.images||[]).map((im,i)=>{const eager=i<2;return `<article class="sellable-card"><img class="gallery-img" src="${esc(window.ETThumb?window.ETThumb(im.src):im.src)}" data-full-src="${esc(im.src)}" alt="${esc(im.alt||`${p.title} ${i+1}`)}" data-gallery-image loading="${eager?'eager':'lazy'}" decoding="async" ${eager?'fetchpriority="high"':''}>${saleBox(p,im,i)}</article>`}).join("")||'<div class="home-note">هنوز تصویری برای این پروژه ثبت نشده است.</div>';
    refreshSaleControls(gallery);
    window.SalesStore?.load().then(()=>refreshSaleControls(gallery)).catch(()=>{});
  }
  function backProjects(){document.querySelectorAll("#projects .project-page").forEach(p=>p.classList.remove("active"));document.getElementById("projectsHome")?.classList.add("active");}
  document.addEventListener("click",e=>{
    const cart=e.target.closest("[data-sale-id]");if(cart){e.preventDefault();e.stopPropagation();window.SalesStore?.buy(cart.dataset.saleId);return;}
    const card=e.target.closest("[data-project-id]");if(card)openProject(card.dataset.projectId);
    const image=e.target.closest("[data-gallery-image]");if(image&&window.openImage)window.openImage(image.dataset.fullSrc||image.src);
  });
  window.openProject=openProject;window.backProjects=backProjects;
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",loadProjects):loadProjects();
})();
