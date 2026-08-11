import React from "react";
import { useFontoAssets } from "./useFontoAssets";

export default function FontoLibraryPanel({ onSelect }) {
  const { textBoxes, styles } = useFontoAssets();

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

  const renderCard = (item, type = "textbox") => (
    <button key={item.id} onClick={() => onSelect?.(item)} style={cardStyle}>
      {(item.preview_url || item.image_url) && (
        <img
          src={item.preview_url || item.image_url}
          alt={item.title || item.name || type}
          style={{ width: "100%", height: "120px", objectFit: "contain" }}
        />
      )}
      <div>{item.title || item.name}</div>
    </button>
  );

  return (
    <div className="fonto-library-panel">
      <h3>Text Boxes</h3>
      <div className="fonto-textbox-scroll" style={rowStyle}>
        {textBoxes
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((item) => renderCard(item))}
      </div>

      <h3>Styles</h3>
      <div className="fonto-style-scroll" style={rowStyle}>
        {styles.map((item) => renderCard(item, "style"))}
      </div>
    </div>
  );
}
