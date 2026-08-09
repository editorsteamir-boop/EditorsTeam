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
  const done=()=>{
    document.body?.classList.add("splash-done");
    document.body?.classList.remove("splash-lock");
    const s=document.getElementById("splashIntro");
    if(s) setTimeout(()=>s.remove(),160);
  };
  if(skip){document.documentElement.classList.add("skip-splash");done();return;}
  // Never wait for window.load or network resources.
  setTimeout(done,900);
  setTimeout(done,1400);
})();