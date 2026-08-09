(() => {
  "use strict";
  const DATA_URL="./data/projects.json";
  const STORAGE_KEY="editorsTeam.projects.v1";
  const esc=v=>String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  let projects=[];

  function clean(v){return (Array.isArray(v)?v:[]).filter(p=>p&&p.active!==false).sort((a,b)=>(a.order||0)-(b.order||0));}
  function backup(){try{return clean(JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"))}catch{return[]}}
  function renderHome(){
    const g=document.getElementById("projectGrid"); if(!g)return;
    g.innerHTML=projects.map(p=>`<button class="project-card" type="button" data-project-id="${esc(p.id)}"><span>${esc(p.icon||"🎨")}</span><b>${esc(p.title||"بدون عنوان")}</b></button>`).join("")||'<div class="home-note">هنوز پروژه‌ای ثبت نشده است.</div>';
  }
  function saleBox(project,item,index){
    if(!window.SalesStore)return "";
    const id=window.SalesStore.saleId("project",project.id,item.src),sale=window.SalesStore.get(id),has=!!(sale?.price_toman>0);
    return `<div class="sale-row" data-sale-row="${esc(id)}"><div class="sale-price ${has?'':'no-price'}" data-sale-price>${has?`${window.SalesStore.formatPrice(sale.price_toman)} <span>تومان</span>`:"قیمت ثبت نشده"}</div><button type="button" class="sale-cart" data-sale-id="${esc(id)}" ${(!has||sale?.active===false)?'disabled':''} aria-label="خرید پروژه ${index+1}"><svg class="cart-icon" viewBox="0 0 24 24"><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 7H7"/><circle cx="10" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/></svg></button></div>`;
  }
  function refreshSales(root=document){
    if(!window.SalesStore)return;
    root.querySelectorAll("[data-sale-row]").forEach(row=>{
      const s=window.SalesStore.get(row.dataset.saleRow),has=!!(s?.price_toman>0),p=row.querySelector("[data-sale-price]"),b=row.querySelector("[data-sale-id]");
      if(p){p.classList.toggle("no-price",!has);p.innerHTML=has?`${window.SalesStore.formatPrice(s.price_toman)} <span>تومان</span>`:"قیمت ثبت نشده";}
      if(b)b.disabled=!has||s?.active===false;
    });
  }
  function openProject(id){
    const p=projects.find(x=>String(x.id)===String(id)); if(!p)return;
    document.getElementById("projectsHome")?.classList.remove("active");
    document.getElementById("projectDynamic")?.classList.add("active");
    const t=document.getElementById("projectDynamicTitle"),ic=document.getElementById("projectDynamicIcon"),g=document.getElementById("projectDynamicGallery");
    if(t)t.textContent=`${p.description||`نمونه پروژه‌های ${p.title}`} (جهت بزرگنمایی کلیک کنید)`;
    if(ic)ic.textContent=p.icon||"🎨";
    if(g){
      g.innerHTML=(p.images||[]).map((im,i)=>`<article class="sellable-card"><img class="gallery-img" src="${esc(im.src)}" alt="${esc(im.alt||`${p.title} ${i+1}`)}" data-gallery-image loading="${i===0?'eager':'lazy'}" decoding="async" ${i===0?'fetchpriority="high"':''}>${saleBox(p,im,i)}</article>`).join("")||'<div class="home-note">هنوز تصویری برای این پروژه ثبت نشده است.</div>';
      refreshSales(g);
      // Sales are intentionally fetched after images are already painted.
      setTimeout(()=>window.SalesStore?.load().then(()=>refreshSales(g)).catch(()=>{}),0);
    }
  }
  function backProjects(){
    document.querySelectorAll("#projects .project-page").forEach(p=>p.classList.remove("active"));
    document.getElementById("projectsHome")?.classList.add("active");
  }
  function start(){
    const cached=backup();
    if(cached.length){projects=cached;renderHome();}
    fetch(DATA_URL,{cache:"no-cache"}).then(r=>r.ok?r.json():Promise.reject()).then(v=>{
      if(!Array.isArray(v))return;
      localStorage.setItem(STORAGE_KEY,JSON.stringify(v));
      projects=clean(v); renderHome();
    }).catch(()=>{if(!projects.length){projects=cached;renderHome();}});
  }
  document.addEventListener("click",e=>{
    const cart=e.target.closest("[data-sale-id]"); if(cart){e.preventDefault();e.stopPropagation();window.SalesStore?.buy(cart.dataset.saleId);return;}
    const card=e.target.closest("[data-project-id]"); if(card)openProject(card.dataset.projectId);
    const img=e.target.closest("[data-gallery-image]"); if(img&&window.openImage)window.openImage(img.src);
  });
  window.openProject=openProject; window.backProjects=backProjects;
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start):start();
})();