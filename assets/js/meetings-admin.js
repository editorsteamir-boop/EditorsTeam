(()=>{"use strict";
const $=id=>document.getElementById(id);
if(!$("meetingsTab"))return;
const URL="https://yxzekduddsewulkbdcoz.supabase.co";
const KEY="sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB";
const SESSION_KEY="editorsTeam.supabase.meetingsAdmin.v1";
const escape=value=>String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
let session=null,requests=[];
const headers=()=>({apikey:KEY,Authorization:"Bearer "+session.access_token,"Content-Type":"application/json"});
function showWorkspace(yes){$("meetingsAuthBox").hidden=yes;$("meetingsWorkspace").hidden=!yes}
function setStatus(message,type="neutral"){const el=$("meetingsAdminStatus");el.textContent=message;el.className="requests-status "+type}
async function load(){
  setStatus("در حال دریافت درخواست‌ها…");
  const response=await fetch(URL+"/rest/v1/meeting_requests?select=*&order=created_at.desc",{headers:headers(),cache:"no-store"});
  if(response.status===401||response.status===403){logout();throw new Error("نشست مدیر منقضی شده است.")}
  const data=await response.json().catch(()=>[]);
  if(!response.ok)throw new Error(data.message||"دریافت درخواست‌ها ناموفق بود.");
  requests=Array.isArray(data)?data:[];
  render();setStatus("فهرست درخواست‌ها به‌روز است.","ok");
}
function render(){
  const pending=requests.filter(x=>x.status==="pending").length;
  const contacted=requests.filter(x=>x.status==="contacted").length;
  $("meetingRequestCount").textContent=requests.length.toLocaleString("fa-IR")+" درخواست";
  $("meetingPendingStat").textContent=pending.toLocaleString("fa-IR");
  $("meetingContactedStat").textContent=contacted.toLocaleString("fa-IR");
  $("meetingTotalStat").textContent=requests.length.toLocaleString("fa-IR");
  $("meetingRequestsList").innerHTML=requests.length?requests.map(item=>`
    <article class="meeting-request-card" data-meeting-id="${escape(item.id)}">
      <div><h3>${escape(item.first_name)} ${escape(item.last_name)}</h3>
      <p>سن: ${Number(item.age).toLocaleString("fa-IR")} سال<br>شماره تماس: <a href="tel:${escape(item.phone)}">${escape(item.phone)}</a><br>زمان ثبت: ${new Date(item.created_at).toLocaleString("fa-IR")}</p></div>
      <div class="meeting-request-actions">
        <select data-meeting-status aria-label="وضعیت درخواست">
          <option value="pending" ${item.status==="pending"?"selected":""}>منتظر بررسی</option>
          <option value="contacted" ${item.status==="contacted"?"selected":""}>تماس گرفته شد</option>
          <option value="completed" ${item.status==="completed"?"selected":""}>تکمیل‌شده</option>
          <option value="cancelled" ${item.status==="cancelled"?"selected":""}>لغوشده</option>
        </select>
        <button type="button" data-save-meeting>ذخیره وضعیت</button>
        <button type="button" class="danger" data-delete-meeting>حذف</button>
      </div>
    </article>`).join(""):"<p>هنوز درخواستی ثبت نشده است.</p>";
}
async function login(event){
  event.preventDefault();
  const email=$("meetingsAdminEmail").value.trim(),password=$("meetingsAdminPassword").value;
  if(!email||!password)return;
  const response=await fetch(URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{apikey:KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})});
  $("meetingsAdminPassword").value="";
  const data=await response.json();
  if(!response.ok||!data.access_token)return alert(data.message||"ورود ناموفق بود.");
  session={access_token:data.access_token,refresh_token:data.refresh_token,email};
  sessionStorage.setItem(SESSION_KEY,JSON.stringify(session));showWorkspace(true);
  try{await load()}catch(error){alert(error.message)}
}
function logout(){session=null;sessionStorage.removeItem(SESSION_KEY);showWorkspace(false)}
$("meetingsAdminLoginForm").addEventListener("submit",login);
$("meetingsReloadBtn").addEventListener("click",()=>load().catch(error=>alert(error.message)));
$("meetingsLogoutBtn").addEventListener("click",logout);
$("meetingRequestsList").addEventListener("click",async event=>{
  const card=event.target.closest("[data-meeting-id]");if(!card)return;
  const id=card.dataset.meetingId;
  try{
    if(event.target.closest("[data-save-meeting]")){
      const status=card.querySelector("[data-meeting-status]").value;
      const response=await fetch(URL+"/rest/v1/meeting_requests?id=eq."+encodeURIComponent(id),{method:"PATCH",headers:{...headers(),Prefer:"return=minimal"},body:JSON.stringify({status,updated_at:new Date().toISOString()})});
      if(!response.ok)throw new Error((await response.json().catch(()=>({}))).message||"ذخیره وضعیت ناموفق بود.");
      await load();
    }
    if(event.target.closest("[data-delete-meeting]")){
      if(!confirm("این درخواست برای همیشه حذف شود؟"))return;
      const response=await fetch(URL+"/rest/v1/meeting_requests?id=eq."+encodeURIComponent(id),{method:"DELETE",headers:headers()});
      if(!response.ok)throw new Error((await response.json().catch(()=>({}))).message||"حذف درخواست ناموفق بود.");
      await load();
    }
  }catch(error){alert(error.message)}
});
try{session=JSON.parse(sessionStorage.getItem(SESSION_KEY)||"null")}catch{}
if(session?.access_token){showWorkspace(true);load().catch(error=>{setStatus(error.message,"bad")})}else showWorkspace(false);
})();