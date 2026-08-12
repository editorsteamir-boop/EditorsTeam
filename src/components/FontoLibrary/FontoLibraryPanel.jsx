import React, { useEffect, useState } from "react";
import { useFontoAssets } from "./useFontoAssets";

const loadedFonts = new Map();

async function loadPreviewFont(item) {
  const url = item.file_url || item.font_url || item.url;
  if (!url) return null;

  const family = `FontoPreview_${item.id}`;
  if (loadedFonts.has(item.id)) return family;

  const face = new FontFace(family, `url(${url})`);
  await face.load();
  document.fonts.add(face);
  loadedFonts.set(item.id, true);

  return family;
}

export default function FontoLibraryPanel({ onSelect }) {
  const { quickStyles, textThemes } = useFontoAssets();
  const [fontFamilies, setFontFamilies] = useState({});

  useEffect(() => {
    textThemes.forEach(async (item) => {
      const family = await loadPreviewFont(item);
      if (family) {
        setFontFamilies((prev) => ({ ...prev, [item.id]: family }));
      }
    });
  }, [textThemes]);

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
        <img src={item.preview_url} alt={item.title || "quick style"} style={{ width: "100%", height: "120px", objectFit: "contain" }} />
      )}
      <div>{item.title}</div>
    </button>
  );

  const renderTheme = (item) => (
    <button key={item.id} onClick={() => onSelect?.({ type: "text-theme", ...item })} style={cardStyle}>
      <div dir="rtl" style={{ fontFamily: fontFamilies[item.id] }}>{item.preview_text_fa}</div>
      <div dir="ltr" style={{ fontFamily: fontFamilies[item.id] }}>{item.preview_text_en}</div>
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
