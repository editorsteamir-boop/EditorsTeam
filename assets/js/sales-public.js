(() => {
  "use strict";
  const SUPABASE_URL="https://yxzekduddsewulkbdcoz.supabase.co";
  const SUPABASE_KEY="sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB";
  const CREATE_PAYMENT_URL=`${SUPABASE_URL}/functions/v1/create-payment`;
  let loaded=false, loading=null; const map=new Map();
  function hash(value){let h=2166136261;const s=String(value||"");for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
  function saleId(kind,ownerId,src){return `${kind==="editor"?"e":"p"}_${hash(`${ownerId}|${String(src||"").split("?")[0]}`)}`;}
  async function load(force=false){if(loaded&&!force)return map;if(loading&&!force)return loading;loading=(async()=>{try{const r=await fetch(`${SUPABASE_URL}/rest/v1/sale_items?select=sale_id,price_toman,active&active=eq.true`,{headers:{apikey:SUPABASE_KEY,Accept:"application/json"},cache:"no-store"});if(!r.ok)throw 0;const rows=await r.json();map.clear();(rows||[]).forEach(x=>map.set(String(x.sale_id),x));loaded=true;}catch(_){/* keep page usable before migration/deploy */}return map;})();return loading;}
  function get(id){return map.get(String(id));}
  function formatPrice(value){return Number(value||0).toLocaleString("fa-IR");}
  async function buy(id){const sale=get(id);if(!sale||!(sale.price_toman>0)||sale.active===false){alert("فروش این پروژه هنوز فعال نشده است.");return;}try{const r=await fetch(CREATE_PAYMENT_URL,{method:"POST",headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({sale_id:id})});let data={};try{data=await r.json();}catch{}if(!r.ok)throw new Error(data.error||data.message||"درگاه پرداخت هنوز فعال نشده است.");if(!data.payment_url)throw new Error("لینک درگاه دریافت نشد.");location.href=data.payment_url;}catch(err){alert(err.message||"اتصال به درگاه پرداخت انجام نشد. پس از فعال شدن زرین‌پال دوباره تلاش کنید.");}}
  window.SalesStore={load,get,saleId,formatPrice,buy,SUPABASE_URL,SUPABASE_KEY};
})();
