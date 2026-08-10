import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const bucket = 'fonto-fonts';
const folder = './fonts';

function category(name){
  const n=name.toLowerCase();
  if(n.includes('arab') || n.includes('persian')) return 'arabic';
  if(n.includes('hand') || n.includes('script')) return 'handwriting';
  if(n.includes('bold') || n.includes('title')) return 'display';
  return 'general';
}

async function upload(file){
 const data=fs.readFileSync(path.join(folder,file));
 const key=`${category(file)}/${file}`;

 await supabase.storage.from(bucket).upload(key,data,{
  upsert:true,
  cacheControl:'31536000'
 });

 await supabase.from('fonto_fonts').upsert({
  name:path.parse(file).name,
  file_name:key,
  category:category(file),
  is_active:true
 },{onConflict:'file_name'});
}

async function run(){
 const files=fs.readdirSync(folder).filter(f=>/\.(ttf|otf)$/i.test(f));
 for(const file of files) await upload(file);
 console.log('Migration finished:', files.length);
}

run();