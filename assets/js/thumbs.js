(() => {
  "use strict";
  window.ETThumb = function(src){
    const s=String(src||"");
    if(!s || /^data:|^blob:|^https?:/i.test(s)) return s;
    const clean=s.split("?")[0].split("#")[0];
    if(!clean.includes("assets/images/")) return s;
    if(/\.(mp4|webm|mov|m4v|ogg)$/i.test(clean)) return s;
    return clean.replace("assets/images/","assets/thumbs/").replace(/\.(png|jpe?g|webp)$/i,".webp");
  };
})();