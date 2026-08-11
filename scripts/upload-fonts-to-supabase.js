const fs = require('fs');
const path = require('path');
const os = require('os');
const AdmZip = require('adm-zip');
const ws = require('ws');
const { createClient } = require('@supabase/supabase-js');

global.WebSocket = ws;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_BUCKET = process.env.TARGET_BUCKET || 'fonto-fonts';
const SOURCE_BUCKET = process.env.SOURCE_BUCKET || '';
const SOURCE_OBJECT = process.env.SOURCE_OBJECT || '';
const CLEANUP_SOURCE = String(process.env.CLEANUP_SOURCE || 'false').toLowerCase() === 'true';

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { enabled: false }
});

function walkFonts(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walkFonts(full));
    else if (/\.(ttf|otf|woff|woff2)$/i.test(full)) out.push(full);
  }
  return out;
}

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.otf') return 'font/otf';
  if (ext === '.woff') return 'font/woff';
  if (ext === '.woff2') return 'font/woff2';
  return 'font/ttf';
}

async function downloadMigrationZip(destDir) {
  if (!SOURCE_BUCKET || !SOURCE_OBJECT) return false;
  console.log(`Downloading migration package: ${SOURCE_BUCKET}/${SOURCE_OBJECT}`);
  const { data, error } = await supabase.storage.from(SOURCE_BUCKET).download(SOURCE_OBJECT);
  if (error) throw error;
  const zipPath = path.join(destDir, 'fonto-migration.zip');
  fs.writeFileSync(zipPath, Buffer.from(await data.arrayBuffer()));
  new AdmZip(zipPath).extractAllTo(destDir, true);
  return true;
}

function extractLocalApk(destDir) {
  const apk = fs.readdirSync('.').find(f => /fonto.*\.apk$/i.test(f));
  if (!apk) return false;
  console.log('Extracting local APK:', apk);
  new AdmZip(apk).extractAllTo(destDir, true);
  return true;
}

function chooseFontRoot(root) {
  const candidates = [
    path.join(root, 'assets', 'fonts'),
    path.join(root, 'Fonto-Web-Pro-Final-Functional', 'assets', 'fonts'),
    path.join(root, 'assets', 'flutter_assets', 'assets', 'fonts'),
    path.join(root, 'apk-extracted', 'assets', 'flutter_assets', 'assets', 'fonts')
  ];
  return candidates.find(p => fs.existsSync(p)) || root;
}

async function saveMetadata(fileName) {
  const row = {
    name: path.basename(fileName, path.extname(fileName)),
    file_path: fileName,
    format: path.extname(fileName).replace('.', '').toLowerCase()
  };
  const { error } = await supabase.from('fonto_fonts').upsert(row);
  if (error) console.warn(`Metadata warning for ${fileName}:`, error.message || error);
}

async function uploadOne(file, fontRoot) {
  const relative = path.relative(fontRoot, file).split(path.sep).join('/');
  const storagePath = relative.replace(/^\/+/, '');
  const buffer = fs.readFileSync(file);
  const { error } = await supabase.storage.from(TARGET_BUCKET).upload(storagePath, buffer, {
    upsert: true,
    contentType: contentType(file),
    cacheControl: '31536000'
  });
  if (error) throw new Error(`${storagePath}: ${error.message || error}`);
  await saveMetadata(storagePath);
  return storagePath;
}

async function pool(items, concurrency, worker) {
  let cursor = 0;
  let done = 0;
  const failures = [];
  async function run() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      try {
        const name = await worker(items[i]);
        done++;
        if (done % 20 === 0 || done === items.length) console.log(`Uploaded ${done}/${items.length}: ${name}`);
      } catch (e) {
        failures.push(String(e.message || e));
        console.error('Upload failed:', e.message || e);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length || 1) }, run));
  return failures;
}

async function main() {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'fonto-migrate-'));
  let prepared = await downloadMigrationZip(work);
  if (!prepared) prepared = extractLocalApk(work);
  if (!prepared) throw new Error('No migration ZIP in Supabase and no local Fonto APK found.');

  const fontRoot = chooseFontRoot(work);
  const fonts = walkFonts(fontRoot);
  console.log(`Found ${fonts.length} font files in ${fontRoot}`);
  if (!fonts.length) throw new Error('No font files found in migration package.');

  const failures = await pool(fonts, 8, file => uploadOne(file, fontRoot));
  if (failures.length) {
    console.error(`Completed with ${failures.length} failures.`);
    failures.slice(0, 20).forEach(x => console.error('-', x));
    process.exitCode = 1;
  } else {
    console.log(`Migration complete: ${fonts.length} fonts uploaded to ${TARGET_BUCKET}.`);
    if (CLEANUP_SOURCE && SOURCE_BUCKET && SOURCE_OBJECT) {
      const { error } = await supabase.storage.from(SOURCE_BUCKET).remove([SOURCE_OBJECT]);
      if (error) console.warn('Could not remove migration ZIP:', error.message || error);
      else console.log('Migration ZIP removed from source bucket.');
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
