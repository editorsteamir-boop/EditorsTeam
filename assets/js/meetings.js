(()=>{"use strict";
const SUPABASE_URL="https://yxzekduddsewulkbdcoz.supabase.co";
const SUPABASE_KEY="sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB";
const modal=document.getElementById("meetingsModal");
const form=document.getElementById("meetingsForm");
if(!modal||!form)return;
const status=document.getElementById("meetingsStatus");
const submit=document.getElementById("meetingsSubmit");
const lead=document.getElementById("meetingsLead");
const normalizeDigits=value=>String(value||"").translate?String(value):String(value||"")
  .replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d))
  .replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d));
async function loadMeetingIntro(){
  if(!lead)return;
  try{
    const response=await fetch(SUPABASE_URL+"/rest/v1/site_settings?setting_key=eq.meeting_intro&select=setting_value",{
      headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY},
      cache:"no-store"
    });
    const rows=await response.json();
    if(response.ok&&Array.isArray(rows)&&rows[0]?.setting_value)lead.textContent=rows[0].setting_value;
  }catch(error){console.warn("Meeting intro is unavailable",error)}
}
loadMeetingIntro();
function openModal(event){
  event?.preventDefault();
  modal.hidden=false;
  document.body.classList.add("meetings-open");
  requestAnimationFrame(()=>document.getElementById("meetingFirstName")?.focus());
}
function closeModal(){
  modal.hidden=true;
  document.body.classList.remove("meetings-open");
  status.textContent="";status.className="meetings-status";
}
document.querySelectorAll("[data-open-meetings]").forEach(el=>el.addEventListener("click",openModal));
modal.querySelectorAll("[data-close-meetings]").forEach(el=>el.addEventListener("click",closeModal));
modal.addEventListener("click",e=>{if(e.target===modal)closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.hidden)closeModal()});
form.addEventListener("submit",async e=>{
  e.preventDefault();
  const firstName=document.getElementById("meetingFirstName").value.trim();
  const lastName=document.getElementById("meetingLastName").value.trim();
  const age=Number(normalizeDigits(document.getElementById("meetingAge").value).replace(/\D/g,""));
  const phone=normalizeDigits(document.getElementById("meetingPhone").value).replace(/\D/g,"");
  status.className="meetings-status error";
  if(firstName.length<2||lastName.length<2){status.textContent="نام و نام خانوادگی را کامل وارد کنید.";return}
  if(!Number.isInteger(age)||age<10||age>100){status.textContent="سن معتبر وارد کنید.";return}
  if(!/^09\d{9}$/.test(phone)){status.textContent="شماره تلفن باید با ۰۹ و ۱۱ رقمی باشد.";return}
  submit.disabled=true;submit.textContent="در حال ثبت…";status.textContent="";
  try{
    const response=await fetch(SUPABASE_URL+"/rest/v1/rpc/submit_meeting_request",{
      method:"POST",
      headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY,"Content-Type":"application/json"},
      body:JSON.stringify({input_first_name:firstName,input_last_name:lastName,input_age:age,input_phone:phone})
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.message||"ثبت درخواست انجام نشد.");
    form.reset();status.className="meetings-status success";
    status.textContent=data.message||"درخواست شما با موفقیت ثبت شد.";
  }catch(error){
    status.className="meetings-status error";
    status.textContent=error.message||"خطا در ارتباط با سرور؛ دوباره تلاش کنید.";
  }finally{submit.disabled=false;submit.textContent="ثبت درخواست"}
});
})();