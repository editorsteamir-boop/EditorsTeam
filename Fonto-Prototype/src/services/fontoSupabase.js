import { getTextBoxes } from './textBoxes.js';
import { getFonts } from './fonts.js';

/**
 * Central loader for Fonto cloud assets.
 * Keeps UI components independent from Supabase details.
 */
export async function loadFontoAssets() {
  const [textBoxes, fonts] = await Promise.all([
    getTextBoxes(),
    getFonts(),
  ]);

  return {
    textBoxes,
    fonts,
    loadedAt: new Date().toISOString(),
  };
}

export function subscribeAssetDebug(data) {
  console.log('[Fonto Supabase Assets]', data);
}
