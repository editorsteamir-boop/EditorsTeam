// Fonto Supabase Lazy Font Loader
// Loads only the selected font and lets browser cache it.

const FONTO_TABLE = 'fonto_fonts';
const FONTO_BUCKET = 'fonto-fonts';

export async function getFontList(supabase) {
  const { data, error } = await supabase
    .from(FONTO_TABLE)
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data;
}

export async function loadFont(supabase, font) {
  const { data } = supabase.storage
    .from(FONTO_BUCKET)
    .getPublicUrl(font.file_name);

  const url = data.publicUrl;

  const face = new FontFace(font.name, `url(${url})`, {
    display: 'swap'
  });

  await face.load();
  document.fonts.add(face);

  return font.name;
}
