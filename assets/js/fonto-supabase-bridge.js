/* EditorsTeam Fonto Supabase Bridge */
(() => {
  const SUPABASE_URL = 'https://yxzekduddsewulkbdcoz.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_rr0hMzT-HuRk4a-frH4QPQ_ZWCgQyHB';
  const table = 'fonto_fonts';

  async function getFonts(search='') {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&is_active=eq.true&order=name.asc`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    let fonts = await res.json();
    if (search) fonts = fonts.filter(f => f.name.includes(search));
    return fonts;
  }

  async function loadFont(font) {
    const { file_name, name } = font;
    const url = `${SUPABASE_URL}/storage/v1/object/public/fonto-fonts/${file_name}`;
    const face = new FontFace(name, `url(${url})`);
    await face.load();
    document.fonts.add(face);
    return name;
  }

  window.FontoSupabase = { getFonts, loadFont };
})();
