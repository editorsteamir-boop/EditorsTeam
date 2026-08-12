import React from "react";
import { useFontoAssets } from "./useFontoAssets";

export default function FontoLibraryPanel({ onSelect }) {
  const { styles } = useFontoAssets();

  const cardStyle = {
    minWidth: "180px",
    flex: "0 0 auto",
    padding: "12px",
    borderRadius: "16px",
    cursor: "pointer",
    overflow: "hidden",
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

  const renderCard = (item) => (
    <button key={item.id} onClick={() => onSelect?.(item)} style={cardStyle}>
      {item.preview_url && (
        <img
          src={item.preview_url}
          alt={item.effects_json?.label || item.name || "style"}
          style={{ width: "100%", height: "120px", objectFit: "contain" }}
        />
      )}
      <div>{item.effects_json?.label || item.name}</div>
    </button>
  );

  return (
    <div className="fonto-library-panel">
      <h3>Fonto Text Styles</h3>
      <div className="fonto-style-scroll" style={rowStyle}>
        {styles.map((item) => renderCard(item))}
      </div>
    </div>
  );
}
