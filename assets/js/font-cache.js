// Browser cache helper for Fonto fonts

export async function preloadFont(fontName) {
  if ('fonts' in document) {
    await document.fonts.load(`16px "${fontName}"`);
  }
}
