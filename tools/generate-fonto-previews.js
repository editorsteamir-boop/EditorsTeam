// Fonto Preview Generator
// Creates cached preview assets for fonto_fonts records.
// Run in a trusted build environment with access to Supabase Storage.

import { createCanvas, registerFont } from 'canvas';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import path from 'node:path';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const BUCKET = 'fonto-fonts';
const PREVIEW_BUCKET = 'fonto-previews';
const TEXT = 'ادیتورز تیم';

async function run(){
  const { data: fonts, error } = await supabase
    .from('fonto_fonts')
    .select('id,name,file_name,category')
    .in('category',['persian','english','arabic']);
  if(error) throw error;

  for(const font of fonts){
    const { data:file } = await supabase.storage.from(BUCKET).download(font.file_name);
    if(!file) continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    const tmp = path.join('/tmp', font.file_name);
    await fs.writeFile(tmp, buffer);
    registerFont(tmp,{family:`preview_${font.id}`});

    const canvas=createCanvas(600,160);
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,600,160);
    ctx.font=`64px preview_${font.id}`;
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(TEXT,300,80);

    const name=`${font.id}-v1.webp`;
    await supabase.storage.from(PREVIEW_BUCKET).upload(name,canvas.toBuffer('image/webp'),{contentType:'image/webp',upsert:true});
    await supabase.from('fonto_fonts').update({preview_file_name:name}).eq('id',font.id);
  }
}

run().catch(console.error);
