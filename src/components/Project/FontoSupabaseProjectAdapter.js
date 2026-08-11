export default function createFontoProjectAdapter(supabase) {
  return {
    async save(project) {
      if (!supabase) return null;
      return supabase.from('fonto_projects').upsert({
        id: project.id,
        name: project.name,
        canvas_state: project.layers,
        updated_at: new Date().toISOString()
      });
    },
    async load(id) {
      if (!supabase) return null;
      return supabase
        .from('fonto_projects')
        .select('*')
        .eq('id', id)
        .single();
    }
  };
}
