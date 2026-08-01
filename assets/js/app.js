const summary = [{"course": "اینشات", "level": "مبتدی", "icon": "🎬", "days": 20, "weight": 4}, {"course": "سامسونگ", "level": "مبتدی", "icon": "📱", "days": 4, "weight": 1}, {"course": "پیکسلب", "level": "مبتدی", "icon": "✍️", "days": 7, "weight": 1}, {"course": "کالرپیکر", "level": "مبتدی", "icon": "🎨", "days": 1, "weight": 1}, {"course": "پیکس آرت", "level": "متوسط", "icon": "🖼️", "days": 8, "weight": 2}, {"course": "هایپیک", "level": "متوسط", "icon": "✨", "days": 4, "weight": 1}, {"course": "پوستر میکر", "level": "متوسط", "icon": "🪧", "days": 5, "weight": 1}, {"course": "کنوا", "level": "متوسط", "icon": "🟣", "days": 6, "weight": 1}, {"course": "کپ کات", "level": "متوسط", "icon": "✂️", "days": 8, "weight": 2}, {"course": "کپشنو", "level": "متوسط", "icon": "📝", "days": 1, "weight": 1}, {"course": "کپشنرز", "level": "متوسط", "icon": "💬", "days": 1, "weight": 1}, {"course": "پینترست", "level": "متوسط", "icon": "📌", "days": 1, "weight": 1}, {"course": "سنپسید", "level": "پیشرفته", "icon": "🌿", "days": 3, "weight": 1}, {"course": "الایت موشن", "level": "پیشرفته", "icon": "🎞️", "days": 8, "weight": 2}, {"course": "لایت روم", "level": "پیشرفته", "icon": "📷", "days": 5, "weight": 1}, {"course": "لئوناردو", "level": "هوش مصنوعی", "icon": "🤖", "days": 1, "weight": 1}, {"course": "پرامپت نویسی", "level": "هوش مصنوعی", "icon": "🧠", "days": 1, "weight": 1}];
const STORAGE_KEYS = Object.freeze({
  done: "et_done_v2",
  notes: "et_notes_v2",
  legacyNotes: "notes"
});

function readStoredObject(key){
  try {
    const value = JSON.parse(localStorage.getItem(key) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch (_) {
    return {};
  }
}

let done = readStoredObject(STORAGE_KEYS.done);
let notes = readStoredObject(STORAGE_KEYS.notes);
if (!Object.keys(notes).length) {
  const oldNotes = readStoredObject(STORAGE_KEYS.legacyNotes);
  if (Object.keys(oldNotes).length) {
    notes = oldNotes;
    try { localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes)); } catch (_) {}
  }
}

let notesSaveTimer = null;
let notesDirty = false;
let filter = "همه";
const tabs = ["همه","مبتدی","متوسط","پیشرفته","هوش مصنوعی"];
const supportUrl = "https://rubika.ir/editorsteamir";
const groupUrl = "https://rubika.ir/joing/BBAEJBICI0KSHFTVXWHINBVKFFWZDRXC";
const videoLinks = {"اینشات": "https://rubika.ir/editorsteamir/BHBIFFFDHIHACAAJ", "سامسونگ": "https://rubika.ir/editorsteamir/BHDADEFDCGBJCAAJ", "پیکسلب": "https://rubika.ir/editorsteamir/BHDBFIAJFFBBHAAJ", "کالرپیکر": "https://rubika.ir/editorsteamir/BGGJIDDBEJEDBAAJ", "پیکس آرت": "https://rubika.ir/editorsteamir/BHCECAHBJHDJIAAJ", "هایپیک": "https://rubika.ir/editorsteamir/BHDDFEAJDJACFAAJ", "پوستر میکر": "https://rubika.ir/editorsteamir/BHDDFIHJGDGGIAAJ", "کنوا": "https://rubika.ir/editorsteamir/BHDDFJHJGHHDEAAJ", "کپ کات": "https://rubika.ir/editorsteamir/BHDDGACJHBFJAAAJ", "کپشنو": "https://rubika.ir/editorsteamir/BGGJIEABFBCBFAAJ", "کپشنرز": "https://rubika.ir/editorsteamir/BGGJIBEBDGCBBAAJ", "پینترست": "https://rubika.ir/editorsteamir/BGGJICFBEDFCBAAJ", "سنپسید": "https://rubika.ir/editorsteamir/BHDDGBBJHFBEGAAJ", "الایت موشن": "https://rubika.ir/editorsteamir/BHDDGBGJHJCEDAAJ", "لایت روم": "https://rubika.ir/editorsteamir/BHDDGCAJIBCCJAAJ", "لئوناردو": "https://rubika.ir/editorsteamir/BGGJIEDBFCAGGAAJ", "پرامپت نویسی": "https://rubika.ir/editorsteamir/BHGFEFEHJHEDBAAJ"};

function saveDone(){
  try { localStorage.setItem(STORAGE_KEYS.done, JSON.stringify(done)); } catch (_) {}
}

function saveNotesNow(){
  if (!notesDirty) return;
  notesDirty = false;
  clearTimeout(notesSaveTimer);
  notesSaveTimer = null;
  try { localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes)); } catch (_) {}
}

function queueNotesSave(){
  notesDirty = true;
  clearTimeout(notesSaveTimer);
  notesSaveTimer = setTimeout(saveNotesNow, 450);
}

function save(){
  saveDone();
  notesDirty = true;
  saveNotesNow();
}
function showView(id, btn) {
  const wasInProjects = document.getElementById("projects")?.classList.contains("active");
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".navbtn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  if(wasInProjects && id!=="projects") backProjects();
  if(id==="notes") renderNotes();
  if(id==="editors" && typeof renderEditors === "function") renderEditors();
  updateProgress();
}
function initTabs(){
  const el=document.getElementById("tabs");
  tabs.forEach(t=>{
    const b=document.createElement("button");
    b.className="tab"+(t===filter?" active":"");
    b.textContent=t;
    b.onclick=()=>{filter=t; document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active")); b.classList.add("active"); renderList();};
    el.appendChild(b);
  });
}
function renderSummary(){
  const el=document.getElementById("summary");
  el.innerHTML="";
  summary.forEach(s=>{
    const d=document.createElement("div");
    d.className="summary-item";
    d.innerHTML=`<b>${s.icon} ${s.course}</b><br>${s.level} | ${s.days} روز<br><span class="small-link">باز کردن لینک آموزش</span>`;
    d.onclick=()=>{ if(videoLinks[s.course]) window.open(videoLinks[s.course], '_blank'); };
    d.style.cursor='pointer';
    el.appendChild(d);
  });
  const today = plan.find(x=>!done[x.id]) || plan[plan.length-1];
  document.getElementById("todayInfo").textContent = today ? `امروز: ${today.course}` : "";
}
function renderList(){
  const q=(document.getElementById("search")?.value || "").trim();
  const list=document.getElementById("list");
  list.innerHTML="";
  const rows=plan.filter(x=>(filter==="همه"||x.level===filter) && (!q || x.course.includes(q) || x.level.includes(q)));
  document.getElementById("resultCount").textContent = rows.length + " مورد";
  rows.forEach(x=>{
    const card=document.createElement("div");
    card.className="card"+(done[x.id]?" done":"");
    card.dataset.id=String(x.id);
    card.innerHTML=`
      <div class="top-row">
        <div style="display:flex;align-items:center;gap:9px">
          <div class="icon">${x.icon}</div>
          <div>
            <div class="badge">هفته ${x.week} | روز ${x.day}</div>
            <div class="course-title">${x.course}</div>
          </div>
        </div>
        <button class="smallbtn done-toggle" style="max-width:90px" onclick="toggleDone(${x.id})">${done[x.id]?'لغو':'انجام شد'}</button>
      </div>
      <div class="meta">سطح: ${x.level} | جلسه ${x.lesson} از ${x.lessonCount}<br>${x.task}</div>
      <textarea id="note-${x.id}" class="note" placeholder="یادداشت این آموزش..." oninput="setNote(${x.id}, this.value)">${notes[x.id]||""}</textarea>
      <div class="card-actions">
        <button class="smallbtn alt done-toggle" onclick="toggleDone(${x.id})">${done[x.id]?'لغو':'انجام شد'}</button>
        <button class="smallbtn" onclick="saveNote(${x.id})">ثبت یادداشت</button>
      </div>`;
    list.appendChild(card);
  });
  updateProgress();
}


function showNoteToast(){
  const t=document.getElementById("noteToast");
  if(!t) return;
  t.classList.add("show");
  clearTimeout(window.__noteToastTimer);
  window.__noteToastTimer=setTimeout(()=>t.classList.remove("show"),1800);
}

function saveNote(id){
  const el=document.getElementById("note-"+id);
  if(el) notes[id]=el.value;
  notesDirty = true;
  saveNotesNow();
  showNoteToast();
}
}

function renderNotes(){
  const el=document.getElementById("notesList");
  el.innerHTML="";
  const entries=Object.entries(notes).filter(([k,v])=>v && v.trim());
  if(!entries.length){el.innerHTML='<div class="empty">هنوز یادداشتی ثبت نشده است.</div>'; return;}
  entries.forEach(([id,note])=>{
    const item=plan.find(x=>x.id==id);
    const d=document.createElement("div");
    d.className="card";
    d.innerHTML=`<div class="badge">${item.week ? 'هفته '+item.week : ''}</div><div class="course-title">${item.icon} ${item.course}</div><div class="meta">${note.replace(/</g,'&lt;')}</div><div style="display:flex;gap:8px;margin-top:10px"><button class="smallbtn" onclick="editNote(${id})">ویرایش</button><button class="smallbtn alt" onclick="deleteNote(${id})">حذف</button></div>`;
    el.appendChild(d);
  });
}

function deleteNote(id){
  if(confirm('یادداشت حذف شود؟')){
    delete notes[id];
    notesDirty = true;
    saveNotesNow();
    const textarea=document.getElementById("note-"+id);
    if(textarea) textarea.value="";
    renderNotes();
  }
}
function editNote(id){
  const v=prompt('ویرایش یادداشت', notes[id]||'');
  if(v!==null){
    notes[id]=v;
    notesDirty = true;
    saveNotesNow();
    const textarea=document.getElementById("note-"+id);
    if(textarea) textarea.value=v;
    renderNotes();
  }
}

function toggleDone(id){
  done[id]=!done[id];
  saveDone();

  const card=document.querySelector(`.card[data-id="${id}"]`);
  if(card){
    card.classList.toggle("done", !!done[id]);
    card.querySelectorAll(".done-toggle").forEach(btn=>{
      btn.textContent=done[id] ? "لغو" : "انجام شد";
    });
  }
  renderSummary();
  updateProgress();
}
function setNote(id, val){
  notes[id]=val;
  queueNotesSave();
}
function updateProgress(){
  const c=Object.values(done).filter(Boolean).length;
  const p=Math.round(c/plan.length*100);
  document.getElementById("doneCount").textContent=c;
  document.getElementById("percent").textContent=p+"٪";
  document.getElementById("bar").style.width=p+"%";
}


function openImage(src){
  document.getElementById("modalImage").src=src;
  document.getElementById("imageModal").classList.add("active");
}
function closeImage(){
  document.getElementById("imageModal").classList.remove("active");
  document.getElementById("modalImage").src="";
}


function showPayment(title, amount){
  document.getElementById("paymentTitle").textContent = "پرداخت برای " + title;
  document.getElementById("paymentAmount").textContent = "مبلغ: " + amount;
  document.getElementById("paymentModal").classList.add("active");
}
function closePayment(){
  document.getElementById("paymentModal").classList.remove("active");
}
function copyCardNumber(){
  const card = "5041721084236240";
  if(navigator.clipboard){
    navigator.clipboard.writeText(card).then(()=>alert("شماره کارت کپی شد"));
  }else{
    alert("شماره کارت: " + card);
  }
}

document.getElementById("search").addEventListener("input", renderList);
initTabs(); renderSummary(); renderList(); updateProgress();

window.addEventListener("pagehide", saveNotesNow);
document.addEventListener("visibilitychange", ()=>{
  if(document.visibilityState === "hidden") saveNotesNow();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js?v=6.0.0", { updateViaCache: "none" });
      await registration.update();
    } catch (_) {}
  });
}
