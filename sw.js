const CACHE="editors-team-v15-fastclean";
self.addEventListener("install",e=>e.waitUntil(self.skipWaiting()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{
  for(const k of await caches.keys()) if(k.startsWith("editors-team-")&&k!==CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
function key(req){const u=new URL(req.url);return new Request(u.origin+u.pathname,{method:"GET"})}
async function swr(req,normalize=false){
  const c=await caches.open(CACHE), k=normalize?key(req):req;
  const hit=await c.match(k,{ignoreSearch:true});
  const net=fetch(req).then(r=>{if(r&&r.ok)c.put(k,r.clone());return r}).catch(()=>null);
  return hit||await net||new Response("",{status:504});
}
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  const nav=r.mode==="navigate", data=u.pathname.includes("/data/")&&u.pathname.endsWith(".json");
  if(nav||data){e.respondWith(swr(r,true));return}
  if(["style","script","image","font"].includes(r.destination)){e.respondWith(swr(r,false))}
});