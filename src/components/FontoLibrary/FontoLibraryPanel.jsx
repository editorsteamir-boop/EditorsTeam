import React from "react";
import { useFontoAssets } from "./useFontoAssets";

export default function FontoLibraryPanel({ onSelect }) {
  const { textBoxes, styles } = useFontoAssets();

  return (
    <div className="fonto-library-panel">
      <h3>Text Boxes</h3>
      <div
        className="fonto-textbox-scroll"
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "12px",
          flexWrap: "nowrap",
        }}
      >
        {textBoxes.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect?.(item)}
            style={{ minWidth: "120px" }}
          >
            {item.title || item.name}
          </button>
        ))}
      </div>

      <h3>Styles</h3>
      <div
        className="fonto-style-scroll"
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "12px",
          flexWrap: "nowrap",
        }}
      >
        {styles.map((item) => (
          <button key={item.id} onClick={() => onSelect?.(item)}>
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
