import React from "react";

export default function FontoCanvasAdapter({ asset, onApply }) {
  if (!asset) return null;

  function applyAsset() {
    if (onApply) {
      onApply({
        type: asset.category === "style" ? "STYLE" : "TEXT_BOX",
        asset
      });
    }
  }

  return (
    <button onClick={applyAsset}>
      Apply {asset.name}
    </button>
  );
}
