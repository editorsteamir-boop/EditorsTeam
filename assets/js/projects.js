(() => {
  "use strict";
  const DATA_URL = "./data/projects.json";
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  let projects = [];
  async function loadProjects(){
    try { const r=await fetch(`${DATA_URL}?v=${Date.now()}`,{cache:"no-store"}); projects=r.ok?await r.json():[]; }
    catch { projects=[]; }
    projects=(Array.isArray(projects)?projects:[]).filter(p=>p.active!==false).sort((a,b)=>(a.order||0)-(b.order||0));
    renderHome();
  }
  function renderHome(){
    const grid=document.getElementById("projectGrid"); if(!grid) return;
    grid.innerHTML=projects.map(p=>`<button class="project-card" type="button" data-project-id="${esc(p.id)}"><span>${esc(p.icon||"🎨")}</span><b>${esc(p.title||"بدون عنوان")}</b></button>`).join("") || '<div class="home-note">هنوز پروژه‌ای ثبت نشده است.</div>';
  }
  function openProject(id){
    const p=projects.find(x=>String(x.id)===String(id)); if(!p)return;
    document.getElementById("projectsHome")?.classList.remove("active");
    const page=document.getElementById("projectDynamic"); page?.classList.add("active");
    document.getElementById("projectDynamicTitle").textContent=`${p.description||`نمونه پروژه‌های ${p.title}`} (جهت بزرگنمایی کلیک کنید)`;
    document.getElementById("projectDynamicIcon").textContent=p.icon||"🎨";
    const gallery=document.getElementById("projectDynamicGallery");
    gallery.innerHTML=(p.images||[]).map((im,i)=>`<img class="gallery-img" src="${esc(im.src)}" alt="${esc(im.alt||`${p.title} ${i+1}`)}" data-gallery-image>`).join("") || '<div class="home-note">هنوز تصویری برای این پروژه ثبت نشده است.</div>';
  }
  function backProjects(){ document.querySelectorAll("#projects .project-page").forEach(p=>p.classList.remove("active")); document.getElementById("projectsHome")?.classList.add("active"); }
  document.addEventListener("click",e=>{
    const card=e.target.closest("[data-project-id]"); if(card)openProject(card.dataset.projectId);
    const image=e.target.closest("[data-gallery-image]"); if(image&&window.openImage)window.openImage(image.src);
  });
  window.openProject=openProject; window.backProjects=backProjects;
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",loadProjects):loadProjects();
})();
