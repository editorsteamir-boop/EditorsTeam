const V="v14-fast";
const CACHE="editors-team-"+V;
self.addEventListener("install",e=>e.waitUntil(self.skipWaiting()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{
  for(const k of await caches.keys()) if(k.startsWith("editors-team-")&&k!==CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
async function swr(req){
  const c=await caches.open(CACHE);
  const hit=await c.match(req,{ignoreSearch:true});
  const net=fetch(req).then(r=>{if(r&&r.ok)c.put(req,r.clone());return r}).catch(()=>null);
  return hit || await net || new Response("",{status:504});
}
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==="navigate"){e.respondWith(swr(r));return;}
  if(["style","script","image","font"].includes(r.destination)||u.pathname.includes("/data/")){
    e.respondWith(swr(r));
  }
});