import React from "react";
import { useFontoAssets } from "./useFontoAssets";

export default function FontoLibraryPanel({ onSelect }) {
  const { textBoxes, styles } = useFontoAssets();

  return (
    <div className="fonto-library-panel">
      <h3>Text Boxes</h3>
      {textBoxes.map((item) => (
        <button key={item.id} onClick={() => onSelect?.(item)}>
          {item.name}
        </button>
      ))}

      <h3>Styles</h3>
      {styles.map((item) => (
        <button key={item.id} onClick={() => onSelect?.(item)}>
          {item.name}
        </button>
      ))}
    </div>
  );
}
