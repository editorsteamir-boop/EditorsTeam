/* EditorsTeam Fonto - local canvas editor + Supabase server-side password check */
(() => {
  'use strict';
  const SUPABASE_URL = 'https://yxzekduddsewulkbdcoz.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB';
  const SESSION_KEY = 'editorsTeam.fonto.access.v1';
  const state = {
    unlocked:false, canvas:null, ctx:null, bg:'transparent', bgImage:null,
    text:'متن خود را بنویسید', font:'Vazirmatn', size:82, color:'#ffffff',
    stroke:'#000000', strokeWidth:0, shadow:true, shadowBlur:12,
    shadowColor:'#000000', gradient:false, gradientA:'#ffffff', gradientB:'#18d96b',
    align:'center', rotate:0, x:.5, y:.5, scale:1
  };
  const $=id=>document.getElementById(id);
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function setStatus(text,type='neutral'){const e=$('fontoStatus');if(e){e.textContent=text;e.className=`fonto-status ${type}`;}}
  function remember(){try{sessionStorage.setItem(SESSION_KEY,JSON.stringify({ok:true,at:Date.now()}));}catch(_){}
  }
  function hasSession(){try{const s=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null');return !!(s?.ok && Date.now()-s.at<8*60*60*1000);}catch{return false;}}
  async function verify(){
    const input=$('fontoPassword'); const password=input?.value||'';
    if(!password)return setStatus('لطفاً رمز ورود را وارد کنید.','bad');
    const btn=$('fontoLoginBtn'); if(btn){btn.disabled=true;btn.textContent='در حال بررسی...';}
    setStatus('در حال بررسی رمز در Supabase...','checking');
    try{
      const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/verify_fonto_password`,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({input_password:password})});
      const ok=r.ok ? await r.json() : false;
      if(ok===true){remember();unlock();}
      else setStatus('رمز ورود صحیح نیست.','bad');
    }catch(e){setStatus('اتصال به سرویس احراز هویت برقرار نشد.','bad');}
    finally{if(btn){btn.disabled=false;btn.textContent='ورود به فونتو';}if(input)input.value='';}
  }
  function unlock(){
    state.unlocked=true;
    $('fontoGate')?.classList.add('hidden'); $('fontoEditor')?.classList.remove('hidden');
    setStatus('دسترسی تأیید شد.','ok'); initCanvas();
  }
  function loadFonts(){
    if(document.getElementById('fontoGoogleFonts'))return;
    const l=document.createElement('link');l.id='fontoGoogleFonts';l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700;800&family=Noto+Sans+Arabic:wght@400;500;700;800&display=swap';document.head.appendChild(l);
  }
  function initCanvas(){
    loadFonts(); state.canvas=$('fontoCanvas'); if(!state.canvas)return;state.ctx=state.canvas.getContext('2d');
    resizeCanvas(); draw();
  }
  function resizeCanvas(){
    const c=state.canvas;if(!c)return;
    const box=c.parentElement.getBoundingClientRect();const w=Math.max(320,Math.min(1080,Math.floor(box.width)));const h=Math.round(w*16/9);
    const dpr=Math.min(window.devicePixelRatio||1,2);c.width=w*dpr;c.height=h*dpr;c.style.aspectRatio='9/16';c.dataset.cssw=w;c.dataset.cssh=h;state.ctx.setTransform(dpr,0,0,dpr,0,0);draw();
  }
  function draw(skipPreviewBackground=false){
    const c=state.canvas,ctx=state.ctx;if(!c||!ctx)return;const w=+c.dataset.cssw||c.width,h=+c.dataset.cssh||c.height;
    ctx.clearRect(0,0,w,h);
    if(!skipPreviewBackground){
      if(state.bg==='transparent'){const s=22;for(let y=0;y<h;y+=s)for(let x=0;x<w;x+=s){ctx.fillStyle=((x/s+y/s)%2)?'#eeeeee':'#d8d8d8';ctx.fillRect(x,y,s,s);}}
      else if(state.bgImage){ctx.drawImage(state.bgImage,0,0,w,h);}
      else{ctx.fillStyle=state.bg;ctx.fillRect(0,0,w,h);}
    }
    const x=state.x*w,y=state.y*h;ctx.save();ctx.translate(x,y);ctx.rotate(state.rotate*Math.PI/180);ctx.scale(state.scale,state.scale);
    ctx.textAlign=state.align;ctx.textBaseline='middle';ctx.font=`800 ${state.size}px "${state.font}", Tahoma, Arial, sans-serif`;
    if(state.shadow){ctx.shadowColor=state.shadowColor;ctx.shadowBlur=state.shadowBlur;ctx.shadowOffsetX=0;ctx.shadowOffsetY=5;}else ctx.shadowColor='transparent';
    const metrics=ctx.measureText(state.text);let fill=state.color;if(state.gradient){const a=ctx.createLinearGradient(-metrics.width/2,0,metrics.width/2,0);a.addColorStop(0,state.gradientA);a.addColorStop(1,state.gradientB);fill=a;}
    if(state.strokeWidth>0){ctx.lineWidth=state.strokeWidth;ctx.strokeStyle=state.stroke;ctx.strokeText(state.text,0,0);}ctx.fillStyle=fill;ctx.fillText(state.text,0,0);ctx.restore();
  }
  function bind(id,fn){const e=$(id);if(!e)return;e.addEventListener('input',fn);e.addEventListener('change',fn);}
  function sync(){
    const pairs={fontoText:'text',fontoFont:'font',fontoSize:'size',fontoColor:'color',fontoStroke:'stroke',fontoStrokeWidth:'strokeWidth',fontoShadowBlur:'shadowBlur',fontoRotate:'rotate',fontoX:'x',fontoY:'y',fontoScale:'scale',fontoGradientA:'gradientA',fontoGradientB:'gradientB'};
    Object.entries(pairs).forEach(([id,k])=>{const e=$(id);if(e)e.value=state[k];});
    $('fontoShadow')&&( $('fontoShadow').checked=state.shadow);$('fontoGradient')&&($('fontoGradient').checked=state.gradient);
  }
  function bindControls(){
    bind('fontoText',e=>{state.text=e.target.value;draw();});bind('fontoFont',e=>{state.font=e.target.value;draw();});
    bind('fontoSize',e=>{state.size=+e.target.value;draw();});bind('fontoColor',e=>{state.color=e.target.value;draw();});
    bind('fontoStroke',e=>{state.stroke=e.target.value;draw();});bind('fontoStrokeWidth',e=>{state.strokeWidth=+e.target.value;draw();});
    bind('fontoShadowBlur',e=>{state.shadowBlur=+e.target.value;draw();});bind('fontoRotate',e=>{state.rotate=+e.target.value;draw();});
    bind('fontoX',e=>{state.x=+e.target.value;draw();});bind('fontoY',e=>{state.y=+e.target.value;draw();});bind('fontoScale',e=>{state.scale=+e.target.value;draw();});
    bind('fontoGradientA',e=>{state.gradientA=e.target.value;draw();});bind('fontoGradientB',e=>{state.gradientB=e.target.value;draw();});
    $('fontoShadow')?.addEventListener('change',e=>{state.shadow=e.target.checked;draw();});$('fontoGradient')?.addEventListener('change',e=>{state.gradient=e.target.checked;draw();});
    document.querySelectorAll('[data-fonto-bg]').forEach(b=>b.addEventListener('click',()=>{state.bg=b.dataset.fontoBg;state.bgImage=null;draw();}));
    $('fontoBgColor')?.addEventListener('input',e=>{state.bg=e.target.value;state.bgImage=null;draw();});
    $('fontoBgImage')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;const im=new Image();im.onload=()=>{state.bgImage=im;state.bg='image';draw();};im.src=URL.createObjectURL(f);});
    $('fontoDownload')?.addEventListener('click',download);
    $('fontoReset')?.addEventListener('click',()=>{Object.assign(state,{text:'متن خود را بنویسید',font:'Vazirmatn',size:82,color:'#ffffff',stroke:'#000000',strokeWidth:0,shadow:true,shadowBlur:12,gradient:false,rotate:0,x:.5,y:.5,scale:1,bg:'transparent',bgImage:null});sync();draw();});
    $('fontoLogout')?.addEventListener('click',()=>{sessionStorage.removeItem(SESSION_KEY);location.reload();});
    let dragging=false;const c=$('fontoCanvas');
    const point=e=>{const r=c.getBoundingClientRect(),t=e.touches?.[0]||e;return {x:clamp((t.clientX-r.left)/r.width,0,1),y:clamp((t.clientY-r.top)/r.height,0,1)};};
    const start=e=>{dragging=true;e.preventDefault();};const move=e=>{if(!dragging)return;const p=point(e);state.x=p.x;state.y=p.y;sync();draw();};const end=()=>dragging=false;
    c.addEventListener('pointerdown',start);window.addEventListener('pointermove',move);window.addEventListener('pointerup',end);
    window.addEventListener('resize',()=>{if(state.unlocked)resizeCanvas();});
  }
  function download(){
    const c=state.canvas;if(!c)return;
    draw(true);
    const png=c.toDataURL('image/png');
    draw(false);
    const a=document.createElement('a');a.download=`fonto-${Date.now()}.png`;a.href=png;a.click();
  }
  function activate(){
    if(!state.unlocked){if(hasSession())unlock();else $('fontoGate')?.classList.remove('hidden');}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    $('fontoLoginBtn')?.addEventListener('click',verify);$('fontoPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter')verify();});bindControls();
    if(location.hash==='#fonto')setTimeout(activate,0);
  });
  window.initFonto=activate;
})();