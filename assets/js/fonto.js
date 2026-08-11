/* EditorsTeam Fonto Pro — Supabase fonts, template boxes, cache, transparent PNG */
(() => {
  'use strict';

  const SUPABASE_URL = 'https://yxzekduddsewulkbdcoz.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB';
  const SESSION_KEY = 'editorsTeam.fonto.access.v2';
  const PREF_KEY = 'editorsTeam.fonto.prefs.v2';
  const FONT_CACHE = 'editorsTeam-fonto-fonts-v2';

  const TEMPLATES = [
    {id:'none',name:'بدون باکس',kind:'none'},
    {id:'standardBox',name:'Standard',kind:'solid',fill:'rgba(255,255,255,.18)',stroke:'rgba(255,255,255,.72)',radius:22},
    {id:'rectangleBox',name:'Rectangle',kind:'solid',fill:'rgba(255,255,255,.16)',stroke:'#fff',radius:0},
    {id:'roundedBox',name:'Rounded',kind:'solid',fill:'rgba(255,255,255,.18)',stroke:'#fff',radius:36},
    {id:'borderBox',name:'Border',kind:'border',fill:'transparent',stroke:'#fff',lineWidth:5,radius:24},
    {id:'dottedBox',name:'Dotted',kind:'border',fill:'rgba(255,255,255,.05)',stroke:'#fff',dash:[10,10],radius:24},
    {id:'glassBox',name:'Glass',kind:'glass',fill:'rgba(255,255,255,.17)',stroke:'rgba(255,255,255,.58)',radius:34},
    {id:'gradientBox',name:'Gradient',kind:'gradient',colors:['#7c3aed','#06b6d4'],stroke:'rgba(255,255,255,.55)',radius:30},
    {id:'shadowBox',name:'Shadow',kind:'solid',fill:'rgba(255,255,255,.94)',stroke:'rgba(255,255,255,.8)',textColor:'#111',shadow:true,radius:28},
    {id:'roundedBox3DShadow',name:'3D Shadow',kind:'solid',fill:'#f8fafc',stroke:'#dbe4f0',textColor:'#111',shadow:true,extrude:true,radius:34},
    {id:'windowsBox',name:'Windows',kind:'solid',fill:'rgba(235,245,255,.95)',stroke:'#3b82f6',textColor:'#111827',radius:10},
    {id:'opacityBox',name:'Opacity',kind:'solid',fill:'rgba(0,0,0,.46)',stroke:'rgba(255,255,255,.22)',radius:18},
    {id:'quoteBox1',name:'Quote 1',kind:'quote',fill:'rgba(255,255,255,.14)',stroke:'rgba(255,255,255,.7)',radius:24},
    {id:'quoteBox2',name:'Quote 2',kind:'quote',fill:'rgba(0,0,0,.40)',stroke:'rgba(255,255,255,.4)',radius:24},
    {id:'quoteBox3',name:'Quote 3',kind:'quote',fill:'rgba(124,58,237,.30)',stroke:'rgba(255,255,255,.55)',radius:28},
    {id:'quoteBox4',name:'Quote 4',kind:'quote',fill:'rgba(6,182,212,.28)',stroke:'rgba(255,255,255,.55)',radius:28},
    {id:'noteBox',name:'Note',kind:'note',fill:'#fff9c4',stroke:'#f6d365',textColor:'#3b2f05',radius:12},
    {id:'iphoneBox',name:'iPhone',kind:'solid',fill:'rgba(248,248,248,.96)',stroke:'#d1d5db',textColor:'#111827',radius:30},
    {id:'capsuleBox',name:'Capsule',kind:'solid',fill:'rgba(255,255,255,.18)',stroke:'#fff',radius:999},
    {id:'bannerBox',name:'Banner',kind:'banner',fill:'rgba(0,0,0,.58)',stroke:'rgba(255,255,255,.18)',radius:4},
    {id:'neonBox',name:'Neon',kind:'neon',fill:'rgba(5,8,22,.70)',stroke:'#22d3ee',radius:24},
    {id:'goldBox',name:'Gold',kind:'gradient',colors:['#8a5b00','#f7cf58','#8a5b00'],stroke:'#ffe9a3',radius:22},
    {id:'redLabel',name:'Red Label',kind:'solid',fill:'#e11d48',stroke:'#fb7185',radius:18},
    {id:'minimalBox',name:'Minimal',kind:'border',fill:'transparent',stroke:'rgba(255,255,255,.45)',lineWidth:2,radius:16}
  ];

  const state = {
    unlocked:false, canvas:null, ctx:null,
    bg:'transparent', bgImage:null,
    text:'متن خود را بنویسید', font:'Vazirmatn', fontUrl:'', size:82, color:'#ffffff',
    stroke:'#000000', strokeWidth:0, shadow:true, shadowBlur:12, shadowColor:'#000000',
    gradient:false, gradientA:'#ffffff', gradientB:'#18d96b', align:'center',
    rotate:0, x:.5, y:.5, scale:1, lineHeight:1.15, autoFit:true,
    templateId:'none', templateOpacity:1, templateWidth:.86, templatePadding:24
  };

  const loadedFonts = new Map();
  const $ = id => document.getElementById(id);
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const esc = s => String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function setStatus(text,type='neutral'){const e=$('fontoStatus');if(e){e.textContent=text;e.className=`fonto-status ${type}`;}}
  function remember(){try{sessionStorage.setItem(SESSION_KEY,JSON.stringify({ok:true,at:Date.now()}));}catch(_){}}
  function hasSession(){try{const s=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null');return !!(s?.ok && Date.now()-s.at<8*60*60*1000);}catch{return false;}}
  function savePrefs(){try{localStorage.setItem(PREF_KEY,JSON.stringify({templateId:state.templateId,templateOpacity:state.templateOpacity,lineHeight:state.lineHeight,autoFit:state.autoFit}));}catch(_){}}
  function restorePrefs(){try{Object.assign(state,JSON.parse(localStorage.getItem(PREF_KEY)||'{}'));}catch(_){}}

  async function verify(){
    const input=$('fontoPassword'), password=input?.value||'';
    if(!password)return setStatus('لطفاً رمز ورود را وارد کنید.','bad');
    const btn=$('fontoLoginBtn'); if(btn){btn.disabled=true;btn.textContent='در حال بررسی...';}
    setStatus('در حال بررسی رمز در Supabase...','checking');
    try{
      const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_fonto_password`,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({input_password:password})});
      const ok=r.ok ? await r.json() : false;
      if(ok===true){remember();unlock();} else setStatus('رمز ورود صحیح نیست.','bad');
    }catch(e){setStatus('اتصال به سرویس احراز هویت برقرار نشد.','bad');}
    finally{if(btn){btn.disabled=false;btn.textContent='ورود به فونتو';}if(input)input.value='';}
  }

  function unlock(){
    state.unlocked=true; restorePrefs();
    $('fontoGate')?.classList.add('hidden'); $('fontoEditor')?.classList.remove('hidden');
    setStatus('دسترسی تأیید شد.','ok'); initCanvas();
  }

  async function getFontRows(){
    try{
      const r=await fetch(`${SUPABASE_URL}/rest/v1/fonto_fonts?select=*`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}});
      if(!r.ok)throw new Error('fonts');
      const rows=await r.json();
      return (Array.isArray(rows)?rows:[]).filter(f=>f.is_active!==false).map((f,i)=>{
        const file=f.file_name||f.file_path||f.storage_path||f.path||'';
        const clean=file.replace(/^\/+/, '');
        const url=f.public_url||f.url||(clean?`${SUPABASE_URL}/storage/v1/object/public/fonto-fonts/${encodeURI(clean)}`:'');
        const label=f.display_name||f.family||f.name||clean.split('/').pop()?.replace(/\.(ttf|otf|woff2?)$/i,'')||`Font ${i+1}`;
        return {name:label,url};
      }).filter(f=>f.url);
    }catch(e){return [];}
  }

  async function cachedResponse(url){
    if(!('caches' in window))return fetch(url);
    const cache=await caches.open(FONT_CACHE); let hit=await cache.match(url);
    if(hit)return hit; const r=await fetch(url,{mode:'cors'}); if(r.ok)await cache.put(url,r.clone()); return r;
  }

  async function loadRemoteFont(name,url){
    if(!url)return name; if(loadedFonts.has(url))return loadedFonts.get(url);
    try{
      const r=await cachedResponse(url); const blob=await r.blob(); const obj=URL.createObjectURL(blob);
      const family=`Fonto_${Math.abs(hash(url))}`; const face=new FontFace(family,`url(${obj})`);
      await face.load(); document.fonts.add(face); loadedFonts.set(url,family); return family;
    }catch(e){console.warn('font load failed',name,e);return name||'Tahoma';}
  }
  function hash(s){let h=0;for(let i=0;i<s.length;i++)h=((h<<5)-h+s.charCodeAt(i))|0;return h;}

  async function populateFonts(){
    const select=$('fontoFont'); if(!select)return;
    const rows=await getFontRows();
    const fallback=[{name:'Vazirmatn',url:''},{name:'Noto Sans Arabic',url:''},{name:'Tahoma',url:''},{name:'Arial',url:''}];
    const list=rows.length?rows:fallback; select.innerHTML='';
    list.forEach((f,i)=>{const o=document.createElement('option');o.value=f.name;o.textContent=f.name;o.dataset.url=f.url||'';select.appendChild(o);});
    const target=[...select.options].find(o=>o.value===state.font)||select.options[0]; if(target){select.value=target.value;state.font=target.value;state.fontUrl=target.dataset.url||'';}
    setStatus(rows.length?`${rows.length} فونت از Supabase آماده است.`:'فونت‌های پایه فعال هستند؛ فونت‌های Supabase پس از مهاجرت نمایش داده می‌شوند.','ok');
  }

  function enhanceUI(){
    const controls=document.querySelector('#fontoEditor .fonto-controls'); if(!controls||$('fontoTemplateGrid'))return;
    [...controls.querySelectorAll('.fonto-panel')].forEach((p,i)=>p.dataset.fontoPanel=['text','color','background','position'][i]||'more');
    const templatePanel=document.createElement('div'); templatePanel.className='fonto-panel'; templatePanel.dataset.fontoPanel='background';
    templatePanel.innerHTML=`<h3>تکس‌باکس‌های آماده</h3><div class="fonto-template-grid" id="fontoTemplateGrid"></div><div class="fonto-field"><label>شفافیت تکس‌باکس</label><input id="fontoTemplateOpacity" type="range" min="0" max="1" step=".05" value="${state.templateOpacity}"></div>`;
    const position=controls.querySelector('[data-fonto-panel="position"]'); controls.insertBefore(templatePanel,position||controls.firstChild);
    const tabs=document.createElement('div');tabs.className='fonto-tabs';tabs.innerHTML='<button class="active" data-fonto-tab="text">فونت</button><button data-fonto-tab="background">پس‌زمینه</button><button data-fonto-tab="color">رنگ و افکت</button><button data-fonto-tab="position">جایگذاری</button>';
    controls.prepend(tabs);
    const grid=$('fontoTemplateGrid');
    TEMPLATES.forEach(t=>{const b=document.createElement('button');b.type='button';b.className='fonto-template-card';b.dataset.template=t.id;b.innerHTML=`<span class="fonto-template-preview ${esc(t.kind)}"><i></i></span><small>${esc(t.name)}</small>`;grid.appendChild(b);});
    function showTab(name){tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.fontoTab===name));controls.querySelectorAll('[data-fonto-panel]').forEach(p=>p.classList.toggle('fonto-panel-hidden',p.dataset.fontoPanel!==name));}
    tabs.addEventListener('click',e=>{const b=e.target.closest('[data-fonto-tab]');if(b)showTab(b.dataset.fontoTab);}); showTab('text'); updateTemplateActive();
  }

  function currentTemplate(){return TEMPLATES.find(t=>t.id===state.templateId)||TEMPLATES[0];}
  function updateTemplateActive(){document.querySelectorAll('[data-template]').forEach(b=>b.classList.toggle('active',b.dataset.template===state.templateId));}

  function initCanvas(){
    enhanceUI(); state.canvas=$('fontoCanvas'); if(!state.canvas)return; state.ctx=state.canvas.getContext('2d');
    populateFonts().finally(()=>{sync();resizeCanvas();draw();});
  }

  function resizeCanvas(){
    const c=state.canvas;if(!c)return; const box=c.parentElement.getBoundingClientRect(); const w=Math.max(320,Math.min(1080,Math.floor(box.width))); const h=Math.round(w*16/9);
    const dpr=Math.min(window.devicePixelRatio||1,2); c.width=w*dpr;c.height=h*dpr;c.style.aspectRatio='9/16';c.dataset.cssw=w;c.dataset.cssh=h;state.ctx.setTransform(dpr,0,0,dpr,0,0);draw();
  }

  function roundRect(ctx,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,rr):(ctx.rect(x,y,w,h));}
  function wrapLines(ctx,text,maxWidth){
    const raw=String(text||'').split(/\n/),out=[];
    raw.forEach(part=>{const words=part.split(/\s+/).filter(Boolean);if(!words.length){out.push('');return;}let line='';words.forEach(word=>{const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>maxWidth&&line){out.push(line);line=word;}else line=test;});if(line)out.push(line);});return out;
  }
  function fitText(ctx,text,maxW,maxH,fontFamily){
    let size=state.size, lines=[]; const min=12;
    while(size>=min){ctx.font=`800 ${size}px "${fontFamily}", Tahoma, Arial, sans-serif`; lines=wrapLines(ctx,text,maxW); const h=lines.length*size*state.lineHeight;if(!state.autoFit||h<=maxH)break;size-=2;}return {size,lines};
  }

  function drawTemplate(ctx,t,x,y,w,h){
    if(!t||t.kind==='none')return;ctx.save();ctx.globalAlpha=state.templateOpacity;
    if(t.shadow){ctx.shadowColor='rgba(0,0,0,.42)';ctx.shadowBlur=22;ctx.shadowOffsetY=10;}
    if(t.kind==='neon'){ctx.shadowColor=t.stroke;ctx.shadowBlur=18;}
    let fill=t.fill||'transparent';if(t.kind==='gradient'&&t.colors){const g=ctx.createLinearGradient(x,y,x+w,y+h);t.colors.forEach((c,i)=>g.addColorStop(i/(t.colors.length-1),c));fill=g;}
    if(t.extrude){ctx.fillStyle='rgba(0,0,0,.25)';roundRect(ctx,x+9,y+11,w,h,t.radius||20);ctx.fill();}
    roundRect(ctx,x,y,w,h,t.radius||0);if(fill!=='transparent'){ctx.fillStyle=fill;ctx.fill();}if(t.stroke){ctx.strokeStyle=t.stroke;ctx.lineWidth=t.lineWidth||2;ctx.setLineDash(t.dash||[]);ctx.stroke();}
    if(t.kind==='quote'){ctx.setLineDash([]);ctx.shadowColor='transparent';ctx.fillStyle='rgba(255,255,255,.68)';ctx.font='700 54px serif';ctx.textAlign='left';ctx.fillText('“',x+18,y+57);}
    if(t.kind==='note'){ctx.fillStyle='rgba(0,0,0,.10)';for(let i=1;i<4;i++)ctx.fillRect(x+20,y+(h/4)*i,w-40,1);}
    ctx.restore();
  }

  async function draw(){
    const c=state.canvas,ctx=state.ctx;if(!c||!ctx)return;const w=+c.dataset.cssw||c.width,h=+c.dataset.cssh||c.height;
    ctx.clearRect(0,0,w,h); // transparent truly stays transparent; checkerboard is CSS only
    if(state.bgImage)ctx.drawImage(state.bgImage,0,0,w,h); else if(state.bg!=='transparent'){ctx.fillStyle=state.bg;ctx.fillRect(0,0,w,h);}
    const family=state.fontUrl?await loadRemoteFont(state.font,state.fontUrl):state.font;
    const cx=state.x*w,cy=state.y*h, boxW=Math.min(w*.92,w*state.templateWidth), boxH=Math.min(h*.42,Math.max(90,state.size*3.4)); const bx=-boxW/2,by=-boxH/2;
    ctx.save();ctx.translate(cx,cy);ctx.rotate(state.rotate*Math.PI/180);ctx.scale(state.scale,state.scale);
    const t=currentTemplate();drawTemplate(ctx,t,bx,by,boxW,boxH);
    const pad=state.templatePadding,maxW=boxW-pad*2,maxH=boxH-pad*2;const fitted=fitText(ctx,state.text,maxW,maxH,family);
    ctx.font=`800 ${fitted.size}px "${family}", Tahoma, Arial, sans-serif`;ctx.textAlign=state.align;ctx.textBaseline='middle';
    if(state.shadow){ctx.shadowColor=state.shadowColor;ctx.shadowBlur=state.shadowBlur;ctx.shadowOffsetX=0;ctx.shadowOffsetY=5;}else ctx.shadowColor='transparent';
    let textColor=t.textColor||state.color; const totalH=fitted.lines.length*fitted.size*state.lineHeight; let yy=-totalH/2+fitted.size*state.lineHeight/2;
    const xx=state.align==='left'?bx+pad:state.align==='right'?bx+boxW-pad:0;
    fitted.lines.forEach(line=>{let fill=textColor;if(state.gradient){const m=ctx.measureText(line);const g=ctx.createLinearGradient(xx-m.width/2,yy,xx+m.width/2,yy);g.addColorStop(0,state.gradientA);g.addColorStop(1,state.gradientB);fill=g;}if(state.strokeWidth>0){ctx.lineWidth=state.strokeWidth;ctx.strokeStyle=state.stroke;ctx.strokeText(line,xx,yy);}ctx.fillStyle=fill;ctx.fillText(line,xx,yy);yy+=fitted.size*state.lineHeight;});
    ctx.restore();
  }

  function bind(id,fn){const e=$(id);if(!e)return;e.addEventListener('input',fn);e.addEventListener('change',fn);}
  function sync(){
    const pairs={fontoText:'text',fontoFont:'font',fontoSize:'size',fontoColor:'color',fontoStroke:'stroke',fontoStrokeWidth:'strokeWidth',fontoShadowBlur:'shadowBlur',fontoRotate:'rotate',fontoX:'x',fontoY:'y',fontoScale:'scale',fontoGradientA:'gradientA',fontoGradientB:'gradientB',fontoTemplateOpacity:'templateOpacity'};
    Object.entries(pairs).forEach(([id,k])=>{const e=$(id);if(e)e.value=state[k];});$('fontoShadow')&&($('fontoShadow').checked=state.shadow);$('fontoGradient')&&($('fontoGradient').checked=state.gradient);updateTemplateActive();
  }

  function bindControls(){
    bind('fontoText',e=>{state.text=e.target.value;draw();});
    bind('fontoFont',async e=>{const o=e.target.selectedOptions[0];state.font=e.target.value;state.fontUrl=o?.dataset.url||'';if(state.fontUrl)await loadRemoteFont(state.font,state.fontUrl);draw();});
    bind('fontoSize',e=>{state.size=+e.target.value;draw();});bind('fontoColor',e=>{state.color=e.target.value;draw();});bind('fontoStroke',e=>{state.stroke=e.target.value;draw();});bind('fontoStrokeWidth',e=>{state.strokeWidth=+e.target.value;draw();});bind('fontoShadowBlur',e=>{state.shadowBlur=+e.target.value;draw();});bind('fontoRotate',e=>{state.rotate=+e.target.value;draw();});bind('fontoX',e=>{state.x=+e.target.value;draw();});bind('fontoY',e=>{state.y=+e.target.value;draw();});bind('fontoScale',e=>{state.scale=+e.target.value;draw();});bind('fontoGradientA',e=>{state.gradientA=e.target.value;draw();});bind('fontoGradientB',e=>{state.gradientB=e.target.value;draw();});
    bind('fontoTemplateOpacity',e=>{state.templateOpacity=+e.target.value;savePrefs();draw();});
    $('fontoShadow')?.addEventListener('change',e=>{state.shadow=e.target.checked;draw();});$('fontoGradient')?.addEventListener('change',e=>{state.gradient=e.target.checked;draw();});
    document.addEventListener('click',e=>{const b=e.target.closest('[data-template]');if(!b)return;state.templateId=b.dataset.template;savePrefs();updateTemplateActive();draw();});
    document.querySelectorAll('[data-fonto-bg]').forEach(b=>b.addEventListener('click',()=>{state.bg=b.dataset.fontoBg;state.bgImage=null;draw();}));
    $('fontoBgColor')?.addEventListener('input',e=>{state.bg=e.target.value;state.bgImage=null;draw();});
    $('fontoBgImage')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const im=new Image();im.onload=()=>{state.bgImage=im;state.bg='image';draw();};im.src=URL.createObjectURL(f);});
    $('fontoDownload')?.addEventListener('click',download);
    $('fontoReset')?.addEventListener('click',()=>{Object.assign(state,{text:'متن خود را بنویسید',font:'Vazirmatn',fontUrl:'',size:82,color:'#ffffff',stroke:'#000000',strokeWidth:0,shadow:true,shadowBlur:12,gradient:false,rotate:0,x:.5,y:.5,scale:1,bg:'transparent',bgImage:null,templateId:'none',templateOpacity:1,lineHeight:1.15,autoFit:true});savePrefs();sync();draw();});
    $('fontoLogout')?.addEventListener('click',()=>{sessionStorage.removeItem(SESSION_KEY);location.reload();});
    let dragging=false;const c=$('fontoCanvas');const point=e=>{const r=c.getBoundingClientRect(),t=e.touches?.[0]||e;return{x:clamp((t.clientX-r.left)/r.width,0,1),y:clamp((t.clientY-r.top)/r.height,0,1)}};const start=e=>{dragging=true;e.preventDefault();};const move=e=>{if(!dragging)return;const p=point(e);state.x=p.x;state.y=p.y;sync();draw();};const end=()=>dragging=false;c.addEventListener('pointerdown',start);window.addEventListener('pointermove',move);window.addEventListener('pointerup',end);window.addEventListener('resize',()=>{if(state.unlocked)resizeCanvas();});
  }

  async function download(){
    const c=state.canvas;if(!c)return;await draw();const a=document.createElement('a');a.download=`fonto-${Date.now()}.png`;a.href=c.toDataURL('image/png');a.click();
  }
  function activate(){if(!state.unlocked){if(hasSession())unlock();else $('fontoGate')?.classList.remove('hidden');}}

  document.addEventListener('DOMContentLoaded',()=>{$('fontoLoginBtn')?.addEventListener('click',verify);$('fontoPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter')verify();});bindControls();if(location.hash==='#fonto')setTimeout(activate,0);});
  window.initFonto=activate;
})();