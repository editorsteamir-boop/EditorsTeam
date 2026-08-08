(() => {
  "use strict";
  let skip=false;
  try{
    const q=new URLSearchParams(location.search);
    skip=q.get("nosplash")==="1"||q.get("view")==="editors"||
      sessionStorage.getItem("editorsTeam.returnView")==="editors"||
      sessionStorage.getItem("editorsTeam.skipSplashOnce")==="1";
    sessionStorage.removeItem("editorsTeam.skipSplashOnce");
  }catch(_){}
  const finish=()=>{
    const b=document.body;
    if(!b)return;
    b.classList.add("splash-done");
    b.classList.remove("splash-lock");
    const s=document.getElementById("splashIntro");
    if(s) setTimeout(()=>s.remove(),180);
  };
  if(skip){ document.documentElement.classList.add("skip-splash"); finish(); return; }
  // This timer starts as soon as the deferred script runs; it never waits for images/window.load.
  setTimeout(finish, 850);
  // Safety fallback even if another script throws.
  setTimeout(finish, 1300);
})();