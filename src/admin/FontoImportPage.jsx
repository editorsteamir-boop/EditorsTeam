import { useState } from "react";

export default function FontoImportPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  async function handleImport() {
    if (!file) return;
    setStatus("Scanning Fonto assets...");

    // Next step:
    // 1. Extract ZIP
    // 2. Upload assets to Supabase Storage
    // 3. Insert into fonto_text_boxes and fonto_styles

    setStatus("Ready for Supabase import");
  }

  return (
    <section className="fonto-import-page">
      <h1>Import Fonto Library</h1>
      <input
        type="file"
        accept=".zip"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleImport}>Import to Supabase</button>
      <p>{status}</p>
    </section>
  );
}
