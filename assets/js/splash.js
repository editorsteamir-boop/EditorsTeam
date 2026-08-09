(() => {
  const params = new URLSearchParams(location.search);
  let returnView = "";
  try { returnView = sessionStorage.getItem("editorsTeam.returnView") || ""; } catch (_) {}
  const skip = params.get("nosplash") === "1" || params.get("view") === "editors" || returnView === "editors";
  if (skip) {
    document.body.classList.add("splash-done");
    document.body.classList.remove("splash-lock");
    const splash = document.getElementById("splashIntro");
    if (splash) splash.style.display = "none";
    return;
  }
  window.addEventListener("load", function(){
    setTimeout(function(){
      document.body.classList.add("splash-done");
      document.body.classList.remove("splash-lock");
    }, 2600);
  });
})();
