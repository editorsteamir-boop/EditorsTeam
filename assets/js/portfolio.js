(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? "").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

  function mediaList(editor){
    if(Array.isArray(editor.portfolioMedia) && editor.portfolioMedia.length){
      return editor.portfolioMedia.filter(x=>x && x.src).map(x=>({type:x.type==="video"?"video":"image",src:String(x.src)}));
    }
    return (Array.isArray(editor.portfolioImages)?editor.portfolioImages:[]).filter(Boolean).map(src=>({type:"image",src:String(src)}));
  }

  function mediaCard(item,index){
    if(item.type==="video"){
      return `<button class="portfolio-media-card is-video" type="button" data-portfolio-video="${esc(item.src)}" aria-label="پخش ویدئوی نمونه‌کار ${index+1}"><video src="${esc(item.src)}" muted playsinline preload="metadata"></video><span class="video-play-badge" aria-hidden="true">▶</span></button>`;
    }
    return `<button class="portfolio-media-card" type="button" data-portfolio-image="${esc(item.src)}" aria-label="نمایش تصویر نمونه‌کار ${index+1}"><img class="gallery-img" src="${esc(item.src)}" alt="نمونه‌کار ${index+1}" loading="lazy"></button>`;
  }

  async function init(){
    const id=new URLSearchParams(location.search).get("id");
    try{
      const r=await fetch("./data/editors.json?v=7.3.0",{cache:"no-cache"});
      if(!r.ok) throw 0;
      const data=await r.json();
      const editor=(Array.isArray(data)?data:[]).find(x=>String(x.id)===String(id));
      if(!editor) throw 0;
      $("portfolioName").textContent=editor.fullName||"ادیتور";
      $("portfolioBadge").textContent=editor.badge||"";
      $("portfolioAvatar").src=editor.image||"./assets/images/default-avatar.svg";
      document.title=`نمونه‌کارهای ${editor.fullName||"ادیتور"}`;
      const media=mediaList(editor);
      $("portfolioGallery").innerHTML=media.length?media.map(mediaCard).join(""):'<div class="portfolio-empty">هنوز نمونه‌کاری برای این ادیتور ثبت نشده است.</div>';
    }catch{
      $("portfolioName").textContent="ادیتور پیدا نشد";
      $("portfolioGallery").innerHTML='<div class="portfolio-empty">اطلاعات این ادیتور در دسترس نیست.</div>';
    }
  }

  function closeModal(){
    const modal=$("portfolioModal"), img=$("portfolioModalImage"), video=$("portfolioModalVideo");
    modal.classList.remove("active"); modal.hidden=true;
    img.hidden=false; img.src="";
    video.pause(); video.removeAttribute("src"); video.load(); video.hidden=true;
  }

  document.addEventListener("click",e=>{
    const imageButton=e.target.closest("[data-portfolio-image]");
    const videoButton=e.target.closest("[data-portfolio-video]");
    if(imageButton){
      const img=$("portfolioModalImage"), video=$("portfolioModalVideo");
      video.hidden=true; img.hidden=false; img.src=imageButton.dataset.portfolioImage;
      $("portfolioModal").hidden=false; $("portfolioModal").classList.add("active");
    }
    if(videoButton){
      const img=$("portfolioModalImage"), video=$("portfolioModalVideo");
      img.hidden=true; video.hidden=false; video.src=videoButton.dataset.portfolioVideo;
      $("portfolioModal").hidden=false; $("portfolioModal").classList.add("active");
      video.play().catch(()=>{});
    }
    if(e.target.id==="portfolioModal"||e.target.id==="portfolioClose") closeModal();
  });
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("portfolioModal").hidden)closeModal();});
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
