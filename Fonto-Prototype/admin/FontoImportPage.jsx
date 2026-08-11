import { useState } from "react";

export default function FontoImportPage() {
  const [file, setFile] = useState(null);

  return (
    <div>
      <h2>Fonto Library Import</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      {file && <p>{file.name}</p>}
    </div>
  );
}
