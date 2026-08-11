// Fonto asset importer placeholder
// Connects extracted Fonto metadata with Supabase Storage and Database.

export function prepareFontoImport(items = []) {
  return items.map((item) => ({ ...item, imported: false }));
}
