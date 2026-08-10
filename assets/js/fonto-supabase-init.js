/* EditorsTeam Fonto Supabase integration */
(async()=>{
  const select=document.getElementById('fontoFont');
  if(!select || !window.FontoSupabase) return;

  try{
    const fonts=await window.FontoSupabase.listFonts();
    if(!Array.isArray(fonts)||!fonts.length) return;

    select.innerHTML='';
    fonts.forEach(font=>{
      const option=document.createElement('option');
      option.value=font.name;
      option.textContent=font.name;
      option.dataset.file=font.file_name;
      select.appendChild(option);
    });

    select.addEventListener('change',async()=>{
      const item=fonts.find(f=>f.name===select.value);
      if(!item) return;
      await window.FontoSupabase.loadFont(item);
      if(window.fontoState){
        window.fontoState.font=item.name;
        window.fontoState.draw?.();
      }
      window.dispatchEvent(new CustomEvent('fonto-font-loaded',{detail:item}));
    });

    if(fonts[0]){
      await window.FontoSupabase.loadFont(fonts[0]);
    }
  }catch(e){
    console.warn('Fonto Supabase fonts unavailable',e);
  }
})();
