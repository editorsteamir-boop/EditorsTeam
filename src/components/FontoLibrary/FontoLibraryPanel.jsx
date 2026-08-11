import React from "react";
import { useFontoAssets } from "./useFontoAssets";

export default function FontoLibraryPanel({ onSelect }) {
  const { textBoxes, styles } = useFontoAssets();

  const cardStyle = {
    minWidth: "150px",
    flex: "0 0 auto",
    padding: "16px",
    borderRadius: "16px",
    cursor: "pointer",
  };

  const rowStyle = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    overflowX: "auto",
    overflowY: "hidden",
    gap: "14px",
    WebkitOverflowScrolling: "touch",
  };

  return (
    <div className="fonto-library-panel">
      <h3>Text Boxes</h3>
      <div className="fonto-textbox-scroll" style={rowStyle}>
        {textBoxes.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect?.(item)}
            style={cardStyle}
          >
            {item.title || item.name}
          </button>
        ))}
      </div>

      <h3>Styles</h3>
      <div className="fonto-style-scroll" style={rowStyle}>
        {styles.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect?.(item)}
            style={cardStyle}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
