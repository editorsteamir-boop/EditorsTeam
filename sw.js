const CACHE_PREFIX="editors-team-";
const STATIC_CACHE=`${CACHE_PREFIX}static-v23-fonto-multiline-previews`;
const PAGE_CACHE=`${CACHE_PREFIX}pages-v23-fonto-multiline-previews`;

self.addEventListener("install",e=>e.waitUntil(self.skipWaiting()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&![STATIC_CACHE,PAGE_CACHE].includes(k)).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));

function normalized(req){const u=new URL(req.url);return new Request(u.origin+u.pathname,{method:"GET"});}
async function swr(req,cacheName,normalize=false){
  const c=await caches.open(cacheName),key=normalize?normalized(req):req;
  const hit=await c.match(key,{ignoreSearch:true});
  const net=fetch(req).then(r=>{if(r&&r.ok)c.put(key,r.clone());return r}).catch(()=>null);
  return hit||await net||new Response("",{status:504});
}
async function networkFirst(req,cacheName,normalize=false){
  const c=await caches.open(cacheName),key=normalize?normalized(req):req;
  try{
    const net=await fetch(req);
    if(net&&net.ok)await c.put(key,net.clone());
    return net;
  }catch{
    return await c.match(key,{ignoreSearch:true})||new Response("",{status:504});
  }
}
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  const nav=r.mode==="navigate";
  const data=u.pathname.includes("/data/")&&u.pathname.endsWith(".json");
  if(nav){e.respondWith(networkFirst(r,PAGE_CACHE,true));return;}
  if(data){e.respondWith(swr(r,PAGE_CACHE,true));return;}
  if(["style","script","image","font"].includes(r.destination)){e.respondWith(swr(r,STATIC_CACHE,false));}
});
