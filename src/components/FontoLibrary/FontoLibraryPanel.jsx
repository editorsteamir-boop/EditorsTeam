import React from "react";
import { useFontoAssets } from "./useFontoAssets";

export default function FontoLibraryPanel({ onSelect }) {
  const { quickStyles, textThemes } = useFontoAssets();

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

  const renderQuickStyle = (item) => (
    <button key={item.id} onClick={() => onSelect?.({ type: "quick-style", ...item })} style={cardStyle}>
      {item.preview_url && (
        <img
          src={item.preview_url}
          alt={item.title || "quick style"}
          style={{ width: "100%", height: "120px", objectFit: "contain" }}
        />
      )}
      <div>{item.title}</div>
    </button>
  );

  const renderTheme = (item) => (
    <button key={item.id} onClick={() => onSelect?.({ type: "text-theme", ...item })} style={cardStyle}>
      <div dir="rtl">{item.preview_text_fa}</div>
      <div dir="ltr">{item.preview_text_en}</div>
      <small>{item.title_fa} / {item.title_en}</small>
    </button>
  );

  return (
    <div className="fonto-library-panel">
      <h3>استایل‌های سریع</h3>
      <div className="fonto-style-scroll" style={rowStyle}>
        {quickStyles.map((item) => renderQuickStyle(item))}
      </div>
      <h3>تم‌های متن</h3>
      <div className="fonto-theme-scroll" style={rowStyle}>
        {textThemes.map((item) => renderTheme(item))}
      </div>
    </div>
  );
}
