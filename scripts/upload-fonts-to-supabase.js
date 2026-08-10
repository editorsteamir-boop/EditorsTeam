const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: { enabled: false }
  }
);

async function findFonts(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) files = files.concat(await findFonts(full));
    else if (/\.(ttf|otf|woff|woff2)$/i.test(full)) files.push(full);
  }
  return files;
}

async function main() {
  const fonts = await findFonts('.');
  console.log(`Found ${fonts.length} fonts`);

  for (const file of fonts) {
    const name = path.basename(file);
    const buffer = fs.readFileSync(file);
    const { error } = await supabase.storage
      .from('fonto-fonts')
      .upload(name, buffer, { upsert: true, contentType: 'font/ttf' });

    if (error) throw error;

    await supabase.from('fonto_fonts').upsert({
      name,
      file_path: name,
      format: path.extname(name).replace('.', '')
    });

    console.log(`Uploaded ${name}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
